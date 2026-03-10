import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { AgentExecution, ListParams } from "../types";

import { BaseResource } from "./base";

export class ExecutionsResource extends BaseResource {
  async list(
    params?: ListParams & {
      agent_id?: string;
      session_id?: string;
      status?: string;
    },
  ): Promise<PaginatedResponse<AgentExecution>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.agent_id) query.agent_id = params.agent_id;
    if (params?.session_id) query.session_id = params.session_id;
    if (params?.status) query.status = params.status;
    const body = await this.http.get("/api/v1/executions", query);
    return parsePaginatedResponse<AgentExecution>(body);
  }

  async get(executionId: string): Promise<AgentExecution> {
    const body = await this.http.get(`/api/v1/executions/${executionId}`);
    return this.unwrap(body) as AgentExecution;
  }
}
