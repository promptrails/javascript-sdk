import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import {
  DataSource,
  DataSourceVersion,
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
  CreateDataSourceVersionRequest,
  ListParams,
} from "../types";

import { BaseResource } from "./base";

export class DataSourcesResource extends BaseResource {
  async list(params?: ListParams): Promise<PaginatedResponse<DataSource>> {
    const body = await this.http.get("/api/v1/data-sources", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    });
    return parsePaginatedResponse<DataSource>(body);
  }

  async get(dataSourceId: string): Promise<DataSource> {
    const body = await this.http.get(`/api/v1/data-sources/${dataSourceId}`);
    return this.unwrap(body) as DataSource;
  }

  async create(data: CreateDataSourceRequest): Promise<DataSource> {
    const body = await this.http.post(
      "/api/v1/data-sources",
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as DataSource;
  }

  async update(
    dataSourceId: string,
    data: UpdateDataSourceRequest,
  ): Promise<DataSource> {
    const body = await this.http.patch(
      `/api/v1/data-sources/${dataSourceId}`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as DataSource;
  }

  async delete(dataSourceId: string): Promise<void> {
    await this.http.delete(`/api/v1/data-sources/${dataSourceId}`);
  }

  async listVersions(dataSourceId: string): Promise<DataSourceVersion[]> {
    const body = await this.http.get(
      `/api/v1/data-sources/${dataSourceId}/versions`,
    );
    const data = this.unwrap(body);
    return Array.isArray(data) ? data : [];
  }

  async createVersion(
    dataSourceId: string,
    data: CreateDataSourceVersionRequest,
  ): Promise<DataSourceVersion> {
    const body = await this.http.post(
      `/api/v1/data-sources/${dataSourceId}/versions`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as DataSourceVersion;
  }

  async promoteVersion(
    dataSourceId: string,
    versionId: string,
  ): Promise<Record<string, unknown>> {
    const body = await this.http.put(
      `/api/v1/data-sources/${dataSourceId}/versions/${versionId}/promote`,
      {},
    );
    return this.unwrap(body) as Record<string, unknown>;
  }

  async previewQuery(
    dataSourceId: string,
    data: { query_template: string; parameters?: Record<string, unknown> },
  ): Promise<Record<string, unknown>> {
    const body = await this.http.post(
      `/api/v1/data-sources/${dataSourceId}/preview-query`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Record<string, unknown>;
  }

  async testConnection(dataSourceId: string): Promise<Record<string, unknown>> {
    const body = await this.http.post(
      `/api/v1/data-sources/${dataSourceId}/test-connection`,
    );
    return this.unwrap(body) as Record<string, unknown>;
  }

  async query(
    dataSourceId: string,
    parameters?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const body = await this.http.post(
      `/api/v1/data-sources/${dataSourceId}/query`,
      parameters ? { parameters } : undefined,
    );
    return this.unwrap(body) as Record<string, unknown>;
  }
}
