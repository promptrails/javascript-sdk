import { DashboardMetrics } from "../types";

import { BaseResource } from "./base";

export class DashboardResource extends BaseResource {
  async getMetrics(params?: { days?: number }): Promise<DashboardMetrics> {
    const query: Record<string, string | number> = {};
    if (params?.days) query.days = params.days;
    const body = await this.http.get("/api/v1/dashboard/metrics", query);
    return this.unwrap(body) as DashboardMetrics;
  }
}
