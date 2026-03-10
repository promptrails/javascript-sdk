import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import {
  Credential,
  CreateCredentialRequest,
  UpdateCredentialRequest,
  ListParams,
} from "../types";

import { BaseResource } from "./base";

export class CredentialsResource extends BaseResource {
  async list(params?: ListParams): Promise<PaginatedResponse<Credential>> {
    const body = await this.http.get("/api/v1/credentials", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    });
    return parsePaginatedResponse<Credential>(body);
  }

  async get(credentialId: string): Promise<Credential> {
    const body = await this.http.get(`/api/v1/credentials/${credentialId}`);
    return this.unwrap(body) as Credential;
  }

  async create(data: CreateCredentialRequest): Promise<Credential> {
    const body = await this.http.post(
      "/api/v1/credentials",
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Credential;
  }

  async update(
    credentialId: string,
    data: UpdateCredentialRequest,
  ): Promise<Credential> {
    const body = await this.http.patch(
      `/api/v1/credentials/${credentialId}`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as Credential;
  }

  async delete(credentialId: string): Promise<void> {
    await this.http.delete(`/api/v1/credentials/${credentialId}`);
  }

  async setDefault(credentialId: string): Promise<Credential> {
    const body = await this.http.post(
      `/api/v1/credentials/${credentialId}/set-default`,
    );
    return this.unwrap(body) as Credential;
  }

  async checkConnection(
    credentialId: string,
  ): Promise<Record<string, unknown>> {
    const body = await this.http.post(
      `/api/v1/credentials/${credentialId}/check`,
    );
    return this.unwrap(body) as Record<string, unknown>;
  }
}
