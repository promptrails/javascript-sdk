import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import {
  WebhookTrigger,
  WebhookTriggerCreateResponse,
  CreateWebhookTriggerRequest,
  UpdateWebhookTriggerRequest,
  ListParams,
} from "../types";

import { BaseResource } from "./base";

export class WebhookTriggersResource extends BaseResource {
  async list(
    params?: ListParams & { agent_id?: string },
  ): Promise<PaginatedResponse<WebhookTrigger>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.agent_id) {
      query.agent_id = params.agent_id;
    }
    const body = await this.http.get("/api/v1/webhook-triggers", query);
    return parsePaginatedResponse<WebhookTrigger>(body);
  }

  async get(triggerId: string): Promise<WebhookTrigger> {
    const body = await this.http.get(`/api/v1/webhook-triggers/${triggerId}`);
    return this.unwrap(body) as WebhookTrigger;
  }

  async create(data: CreateWebhookTriggerRequest): Promise<WebhookTriggerCreateResponse> {
    const body = await this.http.post(
      "/api/v1/webhook-triggers",
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as WebhookTriggerCreateResponse;
  }

  async update(triggerId: string, data: UpdateWebhookTriggerRequest): Promise<WebhookTrigger> {
    const body = await this.http.patch(
      `/api/v1/webhook-triggers/${triggerId}`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as WebhookTrigger;
  }

  async delete(triggerId: string): Promise<void> {
    await this.http.delete(`/api/v1/webhook-triggers/${triggerId}`);
  }
}
