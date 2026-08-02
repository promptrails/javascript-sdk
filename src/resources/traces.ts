import { type PaginatedResponse, parsePaginatedResponse } from "../pagination";
import type { ListParams, Trace, TraceSummary } from "../types";

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

  /**
   * Aggregate statistics over a filtered set of traces. Accepts the same
   * filters as `list` plus `date_from` / `date_to`, `status`, `level`,
   * `model_name`, `agent_id`, `session_id`, `execution_id` and similar query
   * parameters.
   */
  async getSummary(
    filters?: Record<string, string | number>,
  ): Promise<TraceSummary> {
    const body = await this.http.get("/api/v1/traces/summary", filters ?? {});
    return this.unwrap(body) as TraceSummary;
  }

  /** PII-masking report over a filtered set of traces. */
  async piiReport(
    filters?: Record<string, string | number>,
  ): Promise<Record<string, unknown>> {
    const body = await this.http.get(
      "/api/v1/traces/pii-report",
      filters ?? {},
    );
    return this.unwrap(body) as Record<string, unknown>;
  }

  /** Ingest up to 1000 raw spans in one request. */
  async ingest(
    spans: Record<string, unknown>[],
  ): Promise<Record<string, unknown>> {
    const body = await this.http.post("/api/v1/traces/ingest", { spans });
    return this.unwrap(body) as Record<string, unknown>;
  }
}
