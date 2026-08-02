import { type PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { parseSSEStream } from "../sse";
import type { AgentExecution, ListParams, StreamEvent } from "../types";

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

  /** Fetch the execution with its full `children` tree populated. */
  async tree(executionId: string): Promise<AgentExecution> {
    const body = await this.http.get(`/api/v1/executions/${executionId}/tree`);
    return this.unwrap(body) as AgentExecution;
  }

  /** Request cooperative cancellation of a running execution. */
  async cancel(executionId: string): Promise<AgentExecution> {
    const body = await this.http.post(
      `/api/v1/executions/${executionId}/cancel`,
      {},
    );
    return this.unwrap(body) as AgentExecution;
  }

  /** List executions parked at `waiting_approval`. */
  async approvalInbox(
    params?: ListParams,
  ): Promise<PaginatedResponse<AgentExecution>> {
    const body = await this.http.get("/api/v1/executions/approval-inbox", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    });
    return parsePaginatedResponse<AgentExecution>(body);
  }

  /** Approve a run parked at `waiting_approval` and resume it. */
  async approve(
    executionId: string,
    data?: { reason?: string },
  ): Promise<AgentExecution> {
    const body = await this.http.post(
      `/api/v1/executions/${executionId}/approve`,
      (data ?? {}) as Record<string, unknown>,
    );
    return this.unwrap(body) as AgentExecution;
  }

  /** Deny a run parked at `waiting_approval` and resume with a denial. */
  async deny(
    executionId: string,
    data?: { reason?: string },
  ): Promise<AgentExecution> {
    const body = await this.http.post(
      `/api/v1/executions/${executionId}/deny`,
      (data ?? {}) as Record<string, unknown>,
    );
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
      {
        signal: options?.signal,
      },
    );
    yield* parseSSEStream(response, options?.signal);
  }
}
