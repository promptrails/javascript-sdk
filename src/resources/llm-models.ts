import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { LLMModel, AvailableModelGroup } from "../types";

import { BaseResource } from "./base";

export class LLMModelsResource extends BaseResource {
  async list(params?: {
    page?: number;
    limit?: number;
    provider?: string;
  }): Promise<PaginatedResponse<LLMModel>> {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.provider) {
      queryParams.provider = params.provider;
    }
    const body = await this.http.get("/api/v1/llm-models", queryParams);
    return parsePaginatedResponse<LLMModel>(body);
  }

  async listAvailable(): Promise<{ groups: AvailableModelGroup[] }> {
    const body = await this.http.get("/api/v1/llm-models/available");
    const data = this.unwrap(body) as { groups: AvailableModelGroup[] };
    return data;
  }
}
