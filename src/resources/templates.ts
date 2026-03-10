import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { FlowTemplate, ListParams } from "../types";

import { BaseResource } from "./base";

export class TemplatesResource extends BaseResource {
  async list(
    params?: ListParams & { status?: string; category?: string },
  ): Promise<PaginatedResponse<FlowTemplate>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.status) query.status = params.status;
    if (params?.category) query.category = params.category;
    const body = await this.http.get("/api/v1/templates", query);
    return parsePaginatedResponse<FlowTemplate>(body);
  }

  async get(templateId: string): Promise<FlowTemplate> {
    const body = await this.http.get(`/api/v1/templates/${templateId}`);
    return this.unwrap(body) as FlowTemplate;
  }
}
