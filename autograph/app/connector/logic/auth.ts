import { createRemoteJWKSet, jwtVerify } from "jose";
import { getValueFromHeaderMap, mustEnv } from "./utils";
import { Forbidden, JSONValue } from "@hasura/ndc-lambda-sdk";

type Namespace = {
  "user-accesses": UserAccess[];
};

type UserAccess = {
  project: {
    id: string;
  };
  access_level: string;
};

export type JWTPayload = {
  userID: string;
};

// Utility function to validate and get payload of a JWT
export async function validateJWT(
  bearerToken: string,
  projectID: string
): Promise<JWTPayload> {
  try {
    // Remove 'Bearer ' prefix if present
    const token = bearerToken.startsWith("Bearer ")
      ? bearerToken.slice(7)
      : bearerToken;

    // Fetch JWKS from the URL
    const jwksUrl = mustEnv("AUTH_JWKS_URI");
    const JWKS = createRemoteJWKSet(new URL(jwksUrl));

    const { payload, protectedHeader } = await jwtVerify(token, JWKS);
    const namespace = payload["https://promptql.hasura.io"] as Namespace;
    if (!namespace) {
      throw new Error("JWT does not contain the expected namespace");
    }
    const user_accesses = namespace["user-accesses"];
    if (!user_accesses) {
      throw new Error("JWT does not contain the expected user-accesses");
    }
    for (const user_access of user_accesses) {
      if (
        user_access.project.id === projectID &&
        user_access.access_level === "admin"
      ) {
        if (!payload.sub) {
          throw new Error("JWT does not contain the expected sub");
        }
        return {
          userID: payload.sub,
        };
      }
    }
    throw new Error("User does not have admin access to the project");
  } catch (error) {
    throw new Forbidden("Invalid JWT token", {
      error: (error as Error).message,
    });
  }
}

export type Details = {
  user_id: string;
  project_id: string;
  token: string;
  build_id?: string;
};

export async function validatedDetails(headers: JSONValue): Promise<Details> {
  const headersMap = headers.value as Record<string, string>;
  const project_id = getValueFromHeaderMap(
    headersMap,
    "x-hasura-autograph-project-id"
  );
  if (!project_id) {
    throw new Error("x-hasura-autograph-project-id header is required");
  }
  let token = getValueFromHeaderMap(headersMap, "Authorization");
  if (!token) {
    if (!getValueFromHeaderMap(headersMap, "x-hasura-ddn-token")) {
      throw new Error("Authorization or x-hasura-ddn-token header is required");
    }
    token = "Bearer " + getValueFromHeaderMap(headersMap, "x-hasura-ddn-token");
  }

  const user_id = await validateJWT(token, project_id);
  const build_id = getValueFromHeaderMap(
    headersMap,
    "x-hasura-autograph-build-id"
  );
  return {
    user_id: user_id.userID,
    project_id: project_id,
    token: token,
    build_id: build_id,
  };
}
