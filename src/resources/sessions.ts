import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { SessionSummary, ListParams } from "../types";

import { BaseResource } from "./base";

export class SessionsResource extends BaseResource {
  async list(params?: ListParams): Promise<PaginatedResponse<SessionSummary>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    const body = await this.http.get("/api/v1/sessions", query);
    return parsePaginatedResponse<SessionSummary>(body);
  }

  async get(sessionId: string): Promise<SessionSummary> {
    const body = await this.http.get(`/api/v1/sessions/${sessionId}`);
    return this.unwrap(body) as SessionSummary;
  }
}
