import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { ApprovalRequest, DecideApprovalRequest, ListParams } from "../types";

import { BaseResource } from "./base";

export class ApprovalsResource extends BaseResource {
  async list(
    params?: ListParams & { status?: string },
  ): Promise<PaginatedResponse<ApprovalRequest>> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.status) query.status = params.status;
    const body = await this.http.get("/api/v1/approvals", query);
    return parsePaginatedResponse<ApprovalRequest>(body);
  }

  async get(approvalId: string): Promise<ApprovalRequest> {
    const body = await this.http.get(`/api/v1/approvals/${approvalId}`);
    return this.unwrap(body) as ApprovalRequest;
  }

  async decide(
    approvalId: string,
    data: DecideApprovalRequest,
  ): Promise<ApprovalRequest> {
    const body = await this.http.post(
      `/api/v1/approvals/${approvalId}/decide`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as ApprovalRequest;
  }
}
