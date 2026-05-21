import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import {
  AgentTrigger,
  AgentTriggerCreateResponse,
  CreateAgentTriggerRequest,
  UpdateAgentTriggerRequest,
  ListParams,
} from "../types";

import { BaseResource } from "./base";

/**
 * Manage agent triggers: generic webhook, Slack, Telegram, Teams, WhatsApp, schedule.
 */
export class AgentTriggersResource extends BaseResource {
  async list(
    params?: ListParams & { agent_id?: string },
  ): Promise<PaginatedResponse<AgentTrigger>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.agent_id) {
      query.agent_id = params.agent_id;
    }
    const body = await this.http.get("/api/v1/triggers", query);
    return parsePaginatedResponse<AgentTrigger>(body);
  }

  async get(triggerId: string): Promise<AgentTrigger> {
    const body = await this.http.get(`/api/v1/triggers/${triggerId}`);
    return this.unwrap(body) as AgentTrigger;
  }

  async create(
    data: CreateAgentTriggerRequest,
  ): Promise<AgentTriggerCreateResponse> {
    const body = await this.http.post(
      "/api/v1/triggers",
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as AgentTriggerCreateResponse;
  }

  async update(
    triggerId: string,
    data: UpdateAgentTriggerRequest,
  ): Promise<AgentTrigger> {
    const body = await this.http.patch(
      `/api/v1/triggers/${triggerId}`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as AgentTrigger;
  }

  async delete(triggerId: string): Promise<void> {
    await this.http.delete(`/api/v1/triggers/${triggerId}`);
  }
}
