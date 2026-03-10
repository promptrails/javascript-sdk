import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { A2AAgentCard, A2ATask, ListParams } from "../types";

import { BaseResource } from "./base";

export class A2AResource extends BaseResource {
  async getAgentCard(agentId: string): Promise<A2AAgentCard> {
    const body = await this.http.get(`/a2a/agents/${agentId}/agent-card.json`);
    return body as unknown as A2AAgentCard;
  }

  async sendMessage(
    agentId: string,
    message: string,
    options?: {
      blocking?: boolean;
      taskId?: string;
      contextId?: string;
    },
  ): Promise<A2ATask> {
    const params: Record<string, unknown> = {
      message: {
        role: "user",
        parts: [{ type: "text", text: message }],
      },
    };
    if (options?.taskId) params.task_id = options.taskId;
    if (options?.contextId) params.context_id = options.contextId;
    if (options?.blocking === false) {
      params.configuration = { blocking: false };
    }

    const rpcBody = {
      jsonrpc: "2.0",
      method: "message/send",
      params,
      id: 1,
    };
    const body = await this.http.post(`/a2a/agents/${agentId}`, rpcBody);
    const result = (body as Record<string, unknown>).result ?? body;
    return result as unknown as A2ATask;
  }

  async getTask(taskId: string): Promise<A2ATask> {
    const rpcBody = {
      jsonrpc: "2.0",
      method: "tasks/get",
      params: { id: taskId },
      id: 1,
    };
    const body = await this.http.post("/a2a/tasks/get", rpcBody);
    const result = (body as Record<string, unknown>).result ?? body;
    return result as unknown as A2ATask;
  }

  async listTasks(
    params?: ListParams & { context_id?: string; status?: string },
  ): Promise<PaginatedResponse<A2ATask>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.context_id) query.context_id = params.context_id;
    if (params?.status) query.status = params.status;
    const body = await this.http.get("/api/v1/a2a/tasks", query);
    return parsePaginatedResponse<A2ATask>(body);
  }

  async cancelTask(taskId: string): Promise<A2ATask> {
    const rpcBody = {
      jsonrpc: "2.0",
      method: "tasks/cancel",
      params: { id: taskId },
      id: 1,
    };
    const body = await this.http.post("/a2a/tasks/cancel", rpcBody);
    const result = (body as Record<string, unknown>).result ?? body;
    return result as unknown as A2ATask;
  }
}
