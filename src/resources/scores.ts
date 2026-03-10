import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import {
  Score,
  ScoreAggregate,
  ScoreConfig,
  CreateScoreRequest,
  UpdateScoreRequest,
  CreateScoreConfigRequest,
  UpdateScoreConfigRequest,
  ListParams,
} from "../types";

import { BaseResource } from "./base";

export class ScoresResource extends BaseResource {
  async list(
    params?: ListParams & {
      trace_id?: string;
      name?: string;
      source?: string;
      data_type?: string;
      config_id?: string;
    },
  ): Promise<PaginatedResponse<Score>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.trace_id) query.trace_id = params.trace_id;
    if (params?.name) query.name = params.name;
    if (params?.source) query.source = params.source;
    if (params?.data_type) query.data_type = params.data_type;
    if (params?.config_id) query.config_id = params.config_id;
    const body = await this.http.get("/api/v1/scores", query);
    return parsePaginatedResponse<Score>(body);
  }

  async get(scoreId: string): Promise<Score> {
    const body = await this.http.get(`/api/v1/scores/${scoreId}`);
    return this.unwrap(body) as Score;
  }

  async create(data: CreateScoreRequest): Promise<Score> {
    const body = await this.http.post(
      "/api/v1/scores",
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Score;
  }

  async update(scoreId: string, data: UpdateScoreRequest): Promise<Score> {
    const body = await this.http.patch(
      `/api/v1/scores/${scoreId}`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Score;
  }

  async delete(scoreId: string): Promise<void> {
    await this.http.delete(`/api/v1/scores/${scoreId}`);
  }

  async getAggregates(params?: {
    trace_id?: string;
    name?: string;
  }): Promise<ScoreAggregate[]> {
    const query: Record<string, string | number> = {};
    if (params?.trace_id) query.trace_id = params.trace_id;
    if (params?.name) query.name = params.name;
    const body = await this.http.get("/api/v1/scores/aggregates", query);
    const data = this.unwrap(body);
    return Array.isArray(data) ? data : [];
  }

  // Score Configs
  async listConfigs(
    params?: ListParams,
  ): Promise<PaginatedResponse<ScoreConfig>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    const body = await this.http.get("/api/v1/score-configs", query);
    return parsePaginatedResponse<ScoreConfig>(body);
  }

  async getConfig(configId: string): Promise<ScoreConfig> {
    const body = await this.http.get(`/api/v1/score-configs/${configId}`);
    return this.unwrap(body) as ScoreConfig;
  }

  async createConfig(data: CreateScoreConfigRequest): Promise<ScoreConfig> {
    const body = await this.http.post(
      "/api/v1/score-configs",
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as ScoreConfig;
  }

  async updateConfig(
    configId: string,
    data: UpdateScoreConfigRequest,
  ): Promise<ScoreConfig> {
    const body = await this.http.patch(
      `/api/v1/score-configs/${configId}`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as ScoreConfig;
  }

  async deleteConfig(configId: string): Promise<void> {
    await this.http.delete(`/api/v1/score-configs/${configId}`);
  }
}
