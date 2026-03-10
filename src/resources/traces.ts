import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { Trace, ListParams } from "../types";

import { BaseResource } from "./base";

export class TracesResource extends BaseResource {
  async list(
    params?: ListParams & { trace_id?: string; kind?: string },
  ): Promise<PaginatedResponse<Trace>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.trace_id) query.trace_id = params.trace_id;
    if (params?.kind) query.kind = params.kind;
    const body = await this.http.get("/api/v1/traces", query);
    return parsePaginatedResponse<Trace>(body);
  }

  async getByTraceId(traceId: string): Promise<Trace[]> {
    const body = await this.http.get(`/api/v1/traces/${traceId}`);
    const data = this.unwrap(body);
    if (Array.isArray(data)) return data;
    return data ? [data as Trace] : [];
  }
}
