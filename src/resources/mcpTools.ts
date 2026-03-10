import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import {
  MCPTool,
  CreateMCPToolRequest,
  UpdateMCPToolRequest,
  CallMCPToolRequest,
  MCPDiscoverResult,
  MCPCallToolResult,
  ListParams,
} from "../types";

import { BaseResource } from "./base";

export class MCPToolsResource extends BaseResource {
  async list(params?: ListParams): Promise<PaginatedResponse<MCPTool>> {
    const body = await this.http.get("/api/v1/mcp-tools", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    });
    return parsePaginatedResponse<MCPTool>(body);
  }

  async get(toolId: string): Promise<MCPTool> {
    const body = await this.http.get(`/api/v1/mcp-tools/${toolId}`);
    return this.unwrap(body) as MCPTool;
  }

  async create(data: CreateMCPToolRequest): Promise<MCPTool> {
    const body = await this.http.post(
      "/api/v1/mcp-tools",
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as MCPTool;
  }

  async update(toolId: string, data: UpdateMCPToolRequest): Promise<MCPTool> {
    const body = await this.http.patch(
      `/api/v1/mcp-tools/${toolId}`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as MCPTool;
  }

  async delete(toolId: string): Promise<void> {
    await this.http.delete(`/api/v1/mcp-tools/${toolId}`);
  }

  /** Discover available sub-tools for an MCP tool. */
  async discoverTools(toolId: string): Promise<MCPDiscoverResult> {
    const body = await this.http.post(`/api/v1/mcp-tools/${toolId}/discover`);
    return this.unwrap(body) as MCPDiscoverResult;
  }

  /** Execute a tool call with the provided arguments. */
  async callTool(
    toolId: string,
    data: CallMCPToolRequest,
  ): Promise<MCPCallToolResult> {
    const body = await this.http.post(
      `/api/v1/mcp-tools/${toolId}/call`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as MCPCallToolResult;
  }
}
