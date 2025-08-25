import * as client from "openid-client";
import { makeGQLRequest, mustEnv } from "./utils";

export type MetadataOutput = {
  metadata: string;
};

const controlPlaneURL = () => {
  return mustEnv("CONTROL_PLANE_URL");
};

const consoleHost = () => {
  return mustEnv("CONSOLE_HOST");
};

export type Resources = {
  /**
   * The subgraphs of the project
   */
  subgraphs: SubgraphData[];
};

export type SubgraphData = {
  /**
   * The name of the subgraph
   */
  name: string;
  /**
   * The models in the subgraph
   */
  models: ModelCommand[];
  /**
   * The commands in the subgraph
   */
  commands: ModelCommand[];
  /**
   * The object types in the subgraph
   */
  objectTypes: ObjectType[];
};

export type ModelCommand = {
  name: string;
  description?: string;
  type: string;
};

export type ObjectType = {
  name: string;
  description?: string;
  fields: Field[];
};

export type Field = {
  name: string;
  type: string;
  description?: string;
};

// export type Object = {
//   /**
//    * The kind of the entity, can be either Model, Command or ObjectType.
//    */
//   kind: string;
//   definition: {
//     /**
//      * The name of the entity
//      */
//     name: string;
//     /**
//      * The existing description of the entity
//      */
//     description?: string;
//     /**
//      * The fields of the ObjectType (applicable only if kind == ObjectType)
//      */
//     fields?: {
//       name: string;
//       type: string;
//       description?: string;
//     }[];
//   };
// };

export type CreateBuildOutput = {
  build_version: string;
  promptql_url: string;
  description: string;
};

export type MetadataPatch = {
  subgraph: string;
  /**
   * Name of the entity
   */
  name: string;
  /**
   * Name of the field that the description should be added to (applicable only if kind == ObjectType)
   */
  fieldName?: string;
  /**
   * Model, Command or ObjectType
   */
  kind: string;
  /**
   * The description of the entity or field.
   */
  description: string;
};

type Cache = Map<
  string,
  Map<
    string,
    {
      index: number;
      obj: any;
    }
  >
>;

export type ApplyBuildOutput = {
  promptql_url?: string;
};

const token = async () => {
  // Oauth login code
  // const clientId = mustEnv("DATA_PLANE_CLIENT_ID");
  // const clientSecret = mustEnv("DATA_PLANE_CLIENT_SECRET");
  // const accessTokenUrl = mustEnv("ACCESS_TOKEN_URL");
  // const scopes = ["ddn:conn-deploy"]

  // let config: client.Configuration = await client.discovery(
  //     new URL("https://ddn-oauth.pro.arusah.com/.well-known/openid-configuration"),
  //     clientId,
  //     undefined,
  //     client.ClientSecretBasic(clientSecret),
  //   )
  //   let tokens = await client.clientCredentialsGrant(
  //     config,
  //     {
  //       scope: scopes.join(" "),
  //       audience: "ddn.hasura.io"
  //     }
  //   )
  //   console.log(tokens)
  //   return tokens.access_token

  // PAT login
  const ddnAccessToken = mustEnv("DDN_ACCESS_TOKEN");
  return `pat ${ddnAccessToken}`;
};

export async function getModelsCommandsAndTypes(
  project_id: string,
  build_id?: string
): Promise<Resources> {
  const md = await getMetadata(project_id, build_id);
  const metadata = JSON.parse(md.metadata);
  const out: Resources = { subgraphs: [] };
  for (const subgraph of metadata.subgraphs) {
    const subgraphData: SubgraphData = {
      name: subgraph.name,
      models: [],
      commands: [],
      objectTypes: [],
    };
    for (const obj of subgraph.objects) {
      if (obj.kind === "Model") {
        subgraphData.models.push({
          name: obj.definition?.name,
          description: obj.definition?.description,
          type: obj.definition?.objectType,
        });
      }
      if (obj.kind === "Command") {
        subgraphData.commands.push({
          name: obj.definition?.name,
          description: obj.definition?.description,
          type: obj.definition?.outputType,
        });
      }
      if (obj.kind === "ObjectType") {
        subgraphData.objectTypes.push({
          name: obj.definition?.name,
          description: obj.definition?.description,
          fields: obj.definition?.fields?.map((field: any) => {
            const fieldOut: Field = {
              name: field?.name,
              type: field?.type,
            };
            if (field?.description) {
              fieldOut.description = field.description;
            }
            return fieldOut;
          }),
        });
      }
    }
    out.subgraphs.push(subgraphData);
  }
  return out;
}

export function patchMetadata(
  patches: MetadataPatch[],
  baseMetadata: any
): any {
  const patchCache = new Map<string, MetadataPatch>();
  const patchCacheKey = (
    subgraph: string,
    kind: string,
    name: string,
    fieldName?: string
  ) => {
    if (fieldName) {
      return `${subgraph}::${kind}::${name}::${fieldName}`;
    }
    return `${subgraph}::${kind}::${name}`;
  };
  for (const patch of patches) {
    patchCache.set(
      patchCacheKey(patch.subgraph, patch.kind, patch.name, patch.fieldName),
      patch
    );
  }

  for (const subgraph of baseMetadata.subgraphs) {
    for (const obj of subgraph.objects) {
      if (obj.kind === "Model" || obj.kind === "Command") {
        const patch = patchCache.get(
          patchCacheKey(
            subgraph.name,
            obj.kind,
            obj.definition?.name,
            undefined
          )
        );
        if (patch) {
          obj.definition.description = patch.description;
        }
      }
      if (obj.kind === "ObjectType") {
        for (const field of obj.definition.fields) {
          const patch = patchCache.get(
            patchCacheKey(
              subgraph.name,
              obj.kind,
              obj.definition.name,
              field.name
            )
          );
          if (patch) {
            field.description = patch.description;
          }
        }
      }
    }
  }
  return baseMetadata;
}

export async function createPatchBuild(
  project_id: string,
  patches: MetadataPatch[],
  patch_on_build_id?: string,
  description?: string
): Promise<CreateBuildOutput> {
  if (!patch_on_build_id) {
    patch_on_build_id = await getAppliedBuildID(project_id);
  }
  const { metadata, version } = await getBuildMetadata(
    project_id,
    patch_on_build_id
  );
  const baseMetadata = JSON.parse(metadata);

  const patchedMetadata = JSON.stringify(patchMetadata(patches, baseMetadata));

  const mutation = `mutation CreatePatchBuild($project_id: uuid!, $metadata_json: String!, $description: String, $patch_on_build_id: uuid!) {
        ddnCreatePatchBuild(
            project_id: $project_id
            metadata_json: $metadata_json
            description: $description
            patch_on_build_id: $patch_on_build_id
        ) {
            build_version
            build_id
        }
}
    `;
  const buildDescription =
    description || `[By Autograph] with base build ${version}`;
  const variables = {
    project_id,
    metadata_json: patchedMetadata,
    description: buildDescription,
    patch_on_build_id,
  };
  const accessToken = await token();

  const patchResp = await makeGQLRequest(
    mutation,
    controlPlaneURL(),
    accessToken,
    variables
  );
  const patchRespData = patchResp.data?.ddnCreatePatchBuild;
  if (!patchRespData) {
    throw new Error("No build created");
  }

  const getProjectNameQuery = `
        query GetProjectName($project_id: uuid!) {
            ddn_projects_by_pk(id: $project_id) {
                name
                ddn_id
            }
        }   
`;
  const projectNameResp = await makeGQLRequest(
    getProjectNameQuery,
    controlPlaneURL(),
    accessToken,
    { project_id }
  );
  const projectName = projectNameResp.data?.ddn_projects_by_pk?.name;

  return {
    build_version: patchRespData?.build_version,
    promptql_url: `${consoleHost()}/project/${projectName}/build/${
      patchRespData?.build_version
    }/promptql-playground`,
    description: buildDescription,
  };
}

export async function getMetadata(
  project_id: string,
  build_id?: string
): Promise<MetadataOutput> {
  let effectiveBuildID = build_id;
  if (!effectiveBuildID) {
    console.log("build_id not provided, using applied build");
    effectiveBuildID = await getAppliedBuildID(project_id);
  }
  const { metadata } = await getBuildMetadata(project_id, effectiveBuildID);
  return { metadata };
}

type BuildDetails = {
  metadata: string;
  version: string;
};

async function getBuildMetadata(
  project_id: string,
  build_id: string
): Promise<BuildDetails> {
  const query = `
        query GetMetadata($project_id: uuid!, $build_id: uuid!) {
            ddn_build(where: {
                id: {
                _eq: $build_id
                }
                project: {
                id: {
                    _eq: $project_id
                }
                }
            }) {
                metadata_raw
                version
            }  
        }
    `;
  const variables = { project_id, build_id };
  const accessToken = await token();
  try {
    const response = await makeGQLRequest(
      query,
      controlPlaneURL(),
      accessToken,
      variables
    );
    return {
      metadata: response.data?.ddn_build[0]?.metadata_raw,
      version: response.data?.ddn_build[0]?.version,
    };
  } catch (error) {
    console.error("Error fetching build metadata:", error);
    throw error;
  }
}

export async function getAppliedBuildID(project_id: string): Promise<string> {
  const query = `
       query GetAppliedBuild($project_id: uuid!) {
            ddn_projects(where: {
                id: {
                _eq: $project_id
                }
            }) {
                environments {
                    current_build_id
                }
            }
        }
    `;
  const variables = { project_id };
  const accessToken = await token();
  try {
    const response = await makeGQLRequest(
      query,
      controlPlaneURL(),
      accessToken,
      variables
    );
    const buildId =
      response.data?.ddn_projects[0]?.environments[0]?.current_build_id;
    if (!buildId) {
      throw new Error("No applied build found for the project");
    }
    console.log(`Applied build ID: ${buildId}`);
    return buildId;
  } catch (error) {
    console.error("Error fetching applied build ID:", error);
    throw error;
  }
}
