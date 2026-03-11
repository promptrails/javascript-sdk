import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { MediaModel, ListParams } from "../types";

import { BaseResource } from "./base";

export class MediaModelsResource extends BaseResource {
  async list(
    params?: ListParams & {
      provider?: string;
      media_type?: string;
      is_active?: boolean;
    },
  ): Promise<PaginatedResponse<MediaModel>> {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.provider) queryParams.provider = params.provider;
    if (params?.media_type) queryParams.media_type = params.media_type;
    if (params?.is_active !== undefined)
      queryParams.is_active = params.is_active ? 1 : 0;
    const body = await this.http.get("/api/v1/media-models", queryParams);
    return parsePaginatedResponse<MediaModel>(body);
  }
}
