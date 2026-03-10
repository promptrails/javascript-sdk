import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import {
  Agent,
  AgentVersion,
  AgentMemory,
  ExecutionResult,
  Guardrail,
  CreateAgentRequest,
  UpdateAgentRequest,
  CreateAgentVersionRequest,
  ExecuteAgentRequest,
  CreateGuardrailRequest,
  CreateMemoryRequest,
  SearchMemoryRequest,
  ListParams,
} from "../types";

import { BaseResource } from "./base";

export class AgentsResource extends BaseResource {
  async list(
    params?: ListParams & { type?: string; name?: string },
  ): Promise<PaginatedResponse<Agent>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.type) query.type = params.type;
    if (params?.name) query.name = params.name;
    const body = await this.http.get("/api/v1/agents", query);
    return parsePaginatedResponse<Agent>(body);
  }

  async get(agentId: string): Promise<Agent> {
    const body = await this.http.get(`/api/v1/agents/${agentId}`);
    return this.unwrap(body) as Agent;
  }

  async create(data: CreateAgentRequest): Promise<Agent> {
    const body = await this.http.post("/api/v1/agents", data as unknown as Record<string, unknown>);
    return this.unwrap(body) as Agent;
  }

  async update(agentId: string, data: UpdateAgentRequest): Promise<Agent> {
    const body = await this.http.patch(
      `/api/v1/agents/${agentId}`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Agent;
  }

  async delete(agentId: string): Promise<void> {
    await this.http.delete(`/api/v1/agents/${agentId}`);
  }

  async execute(agentId: string, data: ExecuteAgentRequest): Promise<ExecutionResult> {
    const body = await this.http.post(
      `/api/v1/agents/${agentId}/execute`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as ExecutionResult;
  }

  async listVersions(agentId: string): Promise<AgentVersion[]> {
    const body = await this.http.get(`/api/v1/agents/${agentId}/versions`);
    const data = this.unwrap(body);
    return Array.isArray(data) ? data : [];
  }

  async createVersion(agentId: string, data: CreateAgentVersionRequest): Promise<AgentVersion> {
    const body = await this.http.post(
      `/api/v1/agents/${agentId}/versions`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as AgentVersion;
  }

  async promoteVersion(agentId: string, versionId: string): Promise<Record<string, unknown>> {
    const body = await this.http.put(`/api/v1/agents/${agentId}/versions/${versionId}/promote`, {});
    return this.unwrap(body) as Record<string, unknown>;
  }

  async preview(
    agentId: string,
    data: { input: Record<string, unknown>; version_id?: string },
  ): Promise<Record<string, unknown>> {
    const body = await this.http.post(
      `/api/v1/agents/${agentId}/preview`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Record<string, unknown>;
  }

  async listGuardrails(agentId: string): Promise<Guardrail[]> {
    const body = await this.http.get(`/api/v1/agents/${agentId}/guardrails`);
    const data = this.unwrap(body);
    return Array.isArray(data) ? data : [];
  }

  async createGuardrail(agentId: string, data: CreateGuardrailRequest): Promise<Guardrail> {
    const body = await this.http.post(
      `/api/v1/agents/${agentId}/guardrails`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Guardrail;
  }

  async listMemories(
    agentId: string,
    params?: ListParams,
  ): Promise<PaginatedResponse<AgentMemory>> {
    const body = await this.http.get(`/api/v1/agents/${agentId}/memories`, {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    });
    return parsePaginatedResponse<AgentMemory>(body);
  }

  async createMemory(agentId: string, data: CreateMemoryRequest): Promise<AgentMemory> {
    const body = await this.http.post(
      `/api/v1/agents/${agentId}/memories`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as AgentMemory;
  }

  async searchMemories(agentId: string, data: SearchMemoryRequest): Promise<AgentMemory[]> {
    const body = await this.http.post(
      `/api/v1/agents/${agentId}/memories/search`,
      data as unknown as Record<string, unknown>,
    );
    const result = this.unwrap(body);
    return Array.isArray(result) ? result : [];
  }

  async deleteAllMemories(agentId: string): Promise<void> {
    await this.http.delete(`/api/v1/agents/${agentId}/memories`);
  }
}
