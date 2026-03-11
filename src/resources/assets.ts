import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { Asset, AssetSignedUrl, ListParams } from "../types";

import { BaseResource } from "./base";

export class AssetsResource extends BaseResource {
  async list(
    params?: ListParams & {
      type?: string;
      provider?: string;
      execution_id?: string;
      agent_id?: string;
    },
  ): Promise<PaginatedResponse<Asset>> {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.type) queryParams.type = params.type;
    if (params?.provider) queryParams.provider = params.provider;
    if (params?.execution_id) queryParams.execution_id = params.execution_id;
    if (params?.agent_id) queryParams.agent_id = params.agent_id;
    const body = await this.http.get("/api/v1/assets", queryParams);
    return parsePaginatedResponse<Asset>(body);
  }

  async get(assetId: string): Promise<Asset> {
    const body = await this.http.get(`/api/v1/assets/${assetId}`);
    return this.unwrap(body) as Asset;
  }

  async delete(assetId: string): Promise<void> {
    await this.http.delete(`/api/v1/assets/${assetId}`);
  }

  async getSignedUrl(assetId: string): Promise<AssetSignedUrl> {
    const body = await this.http.get(`/api/v1/assets/${assetId}/signed-url`);
    return this.unwrap(body) as AssetSignedUrl;
  }
}
