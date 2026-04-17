import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { parseSSEStream } from "../sse";
import { AgentExecution, ListParams, StreamEvent } from "../types";

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

  /**
   * Subscribe to the live SSE stream for an execution. Useful when the
   * execution was started via a non-chat path (e.g. agents.execute) and the
   * caller wants progressive updates.
   */
  async *stream(
    executionId: string,
    options?: { signal?: AbortSignal },
  ): AsyncGenerator<StreamEvent> {
    const response = await this.http.stream(
      "GET",
      `/api/v1/executions/${executionId}/stream`,
      { signal: options?.signal },
    );
    yield* parseSSEStream(response, options?.signal);
  }
}
