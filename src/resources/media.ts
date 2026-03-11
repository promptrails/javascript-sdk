import { MediaGenerateRequest, MediaGenerateResponse } from "../types";

import { BaseResource } from "./base";

export class MediaResource extends BaseResource {
  async generate(data: MediaGenerateRequest): Promise<MediaGenerateResponse> {
    const body = await this.http.post(
      "/api/v1/media/generate",
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as MediaGenerateResponse;
  }
}
