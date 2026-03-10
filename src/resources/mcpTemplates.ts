import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import {
  MCPTemplate,
  MCPTool,
  InstallMCPTemplateRequest,
  ListParams,
} from "../types";

import { BaseResource } from "./base";

export class MCPTemplatesResource extends BaseResource {
  async list(
    params?: ListParams & { category?: string },
  ): Promise<PaginatedResponse<MCPTemplate>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.category) query.category = params.category;
    const body = await this.http.get("/api/v1/mcp-templates", query);
    return parsePaginatedResponse<MCPTemplate>(body);
  }

  async get(templateId: string): Promise<MCPTemplate> {
    const body = await this.http.get(`/api/v1/mcp-templates/${templateId}`);
    return this.unwrap(body) as MCPTemplate;
  }

  async getBySlug(slug: string): Promise<MCPTemplate> {
    const body = await this.http.get(`/api/v1/mcp-templates/slug/${slug}`);
    return this.unwrap(body) as MCPTemplate;
  }

  async install(
    slug: string,
    data: InstallMCPTemplateRequest,
  ): Promise<MCPTool> {
    const body = await this.http.post(
      `/api/v1/mcp-templates/slug/${slug}/install`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as MCPTool;
  }
}
