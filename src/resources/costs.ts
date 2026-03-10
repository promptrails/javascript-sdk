import { CostSummary } from "../types";

import { BaseResource } from "./base";

export class CostsResource extends BaseResource {
  async getSummary(params?: { from?: string; to?: string }): Promise<CostSummary> {
    const query: Record<string, string | number> = {};
    if (params?.from) query.from = params.from;
    if (params?.to) query.to = params.to;
    const body = await this.http.get("/api/v1/costs/summary", query);
    return this.unwrap(body) as CostSummary;
  }

  async getAgentSummary(
    agentId: string,
    params?: { from?: string; to?: string },
  ): Promise<CostSummary> {
    const query: Record<string, string | number> = {};
    if (params?.from) query.from = params.from;
    if (params?.to) query.to = params.to;
    const body = await this.http.get(`/api/v1/costs/agents/${agentId}`, query);
    return this.unwrap(body) as CostSummary;
  }
}
