import axios from "axios";

export const mustEnv = (name: string): string => {
  if (!process.env[name]) {
    throw new Error(`${name} not set`);
  }
  return process.env[name];
};

export const makeGQLRequest = async (
  query: string,
  url: string,
  accessToken: string,
  variables?: any
) => {
  try {
    const response = await axios.post(
      url,
      {
        query,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${accessToken}`,
        },
      }
    );
    if (response.status !== 200) {
      throw new Error(
        `Non Ok status: ${response.status} ${response.statusText}`
      );
    }
    if (response.data.errors) {
      throw new Error(
        `GraphQL errors: ${JSON.stringify(response.data.errors)}`
      );
    }
    return response.data;
  } catch (error) {
    console.error("Error occurred with making GQL req:", error);
    throw error;
  }
};

export function getValueFromHeaderMap(
  record: Record<string, string>,
  key: string
): string | undefined {
  const lowercaseKey = key.toLowerCase();

  // Find the first matching key (case-insensitive)
  const matchingKey = Object.keys(record).find(
    (k) => k.toLowerCase() === lowercaseKey
  );

  // Return the value if a matching key was found
  return matchingKey !== undefined ? record[matchingKey] : undefined;
}

export const envCheck = (envs: string[]) => {
  for (const env of envs) {
    if (!process.env[env]) {
      throw new Error(`${env} not set`);
    }
  }
};
