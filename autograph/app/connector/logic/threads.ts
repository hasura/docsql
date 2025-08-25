import axios from "axios";
import { mustEnv } from "./utils";

const promptqlPlaygroundURL = () => {
  return mustEnv("PROMPTQL_PLAYGROUND_URL");
};

export type Thread = {
  thread_id: string;
  title?: string;
  state?: string;
  created_at: string;
  user_id?: string;
  project_id: string;
  build_id?: string;
};

export async function getThreads(
  project_id: string,
  token: string,
  from_thread_created_at?: string,
  to_thread_created_at?: string,
  // limit = 10,
  build_id?: string,
  sample_artifacts = true
): Promise<Thread[]> {
  try {
    const threadIds = await fetchThreadIds(
      project_id,
      token,
      from_thread_created_at,
      to_thread_created_at,
      // limit,
      build_id
    );
    const threads = await fetchThreads(threadIds, token, sample_artifacts);
    return threads;
  } catch (error) {
    console.error("Error fetching threads:", error);
    throw error;
  }
}
async function fetchThreadIds(
  project_id: string,
  token: string,
  from_thread_created_at?: string,
  to_thread_created_at?: string,
  // limit = 10,
  build_id?: string
): Promise<string[]> {
  try {
    const url = new URL(`${promptqlPlaygroundURL()}/api-threads`);
    url.searchParams.append("project_id", project_id);
    if (from_thread_created_at) url.searchParams.append("from_created_at", from_thread_created_at);
    if (to_thread_created_at) url.searchParams.append("to_created_at", to_thread_created_at);
    if (build_id) url.searchParams.append("build_id", build_id);

    const response = await axios.get(url.toString(), {
      headers: {
        Authorization: token,
      },
    });
    if (!response.data) {
      throw new Error(`No data in response`);
    }
    let allThreads = response.data as Thread[];
    // If no build id is given, get the threads for applied build only
    if (!build_id) {
      allThreads = allThreads.filter((thread) => !thread.build_id);
    }
    // return allThreads.slice(0, limit);
    const thread_ids = allThreads.map((thread) => thread.thread_id);
    return thread_ids;
  } catch (error) {
    console.error("Error fetching thread IDs:", error);
    throw error;
  }
}

async function fetchThreads(thread_ids: string[], token: string, sample_artifacts = true): Promise<Thread[]> {
  try {
    const threads: Thread[] = [];
    for (const thread_id of thread_ids) {
      const url = new URL(`${promptqlPlaygroundURL()}/api-threads/${thread_id}`);
      const response = await axios.get(url.toString(), {
        headers: {
          Authorization: token,
        },
      });
      if (!response.data) {
        throw new Error(`No data in response`);
      }
      const thread = response.data;
      if (thread.state) {
        thread.state = processState(thread.state, sample_artifacts);
      }
      threads.push(thread as Thread);
    }
    return threads;
  } catch (error) {
    console.error("Error fetching thread:", error);
    throw error;
  }
}

const processState = (state: any, sample_artifacts: boolean): string => {
  if (!sample_artifacts || !state?.artifacts) {
    return JSON.stringify(state);
  }
  for (const artifact of state.artifacts) {
    if (artifact.artifact_type === "table" && artifact.data) {
      artifact.data = artifact.data.slice(0, 2);
    }
  }
  return JSON.stringify(state);
};
