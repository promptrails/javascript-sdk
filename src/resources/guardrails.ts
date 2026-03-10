import { Guardrail, UpdateGuardrailRequest } from "../types";

import { BaseResource } from "./base";

export class GuardrailsResource extends BaseResource {
  async update(guardrailId: string, data: UpdateGuardrailRequest): Promise<Guardrail> {
    const body = await this.http.patch(
      `/api/v1/guardrails/${guardrailId}`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Guardrail;
  }

  async delete(guardrailId: string): Promise<void> {
    await this.http.delete(`/api/v1/guardrails/${guardrailId}`);
  }
}
