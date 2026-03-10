import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import {
  Prompt,
  PromptVersion,
  CreatePromptRequest,
  UpdatePromptRequest,
  CreatePromptVersionRequest,
  RunPromptRequest,
  RunPromptResponse,
  ListParams,
} from "../types";

import { BaseResource } from "./base";

export class PromptsResource extends BaseResource {
  async list(params?: ListParams): Promise<PaginatedResponse<Prompt>> {
    const body = await this.http.get("/api/v1/prompts", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    });
    return parsePaginatedResponse<Prompt>(body);
  }

  async get(promptId: string): Promise<Prompt> {
    const body = await this.http.get(`/api/v1/prompts/${promptId}`);
    return this.unwrap(body) as Prompt;
  }

  async create(data: CreatePromptRequest): Promise<Prompt> {
    const body = await this.http.post(
      "/api/v1/prompts",
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Prompt;
  }

  async update(promptId: string, data: UpdatePromptRequest): Promise<Prompt> {
    const body = await this.http.patch(
      `/api/v1/prompts/${promptId}`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Prompt;
  }

  async delete(promptId: string): Promise<void> {
    await this.http.delete(`/api/v1/prompts/${promptId}`);
  }

  async listVersions(promptId: string): Promise<PromptVersion[]> {
    const body = await this.http.get(`/api/v1/prompts/${promptId}/versions`);
    const data = this.unwrap(body);
    return Array.isArray(data) ? data : [];
  }

  async createVersion(
    promptId: string,
    data: CreatePromptVersionRequest,
  ): Promise<PromptVersion> {
    const body = await this.http.post(
      `/api/v1/prompts/${promptId}/versions`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as PromptVersion;
  }

  async promoteVersion(
    promptId: string,
    versionId: string,
  ): Promise<Record<string, unknown>> {
    const body = await this.http.put(
      `/api/v1/prompts/${promptId}/versions/${versionId}/promote`,
      {},
    );
    return this.unwrap(body) as Record<string, unknown>;
  }

  async preview(
    promptId: string,
    data: { input: Record<string, unknown>; version_id?: string },
  ): Promise<Record<string, unknown>> {
    const body = await this.http.post(
      `/api/v1/prompts/${promptId}/preview`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Record<string, unknown>;
  }

  async runPrompt(
    promptId: string,
    data: RunPromptRequest,
  ): Promise<RunPromptResponse> {
    const body = await this.http.post(
      `/api/v1/prompts/${promptId}/run`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as RunPromptResponse;
  }
}
