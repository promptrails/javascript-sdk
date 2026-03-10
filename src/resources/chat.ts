import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import {
  ChatSession,
  ChatMessage,
  CreateChatSessionRequest,
  SendMessageRequest,
  ListParams,
} from "../types";

import { BaseResource } from "./base";

export class ChatResource extends BaseResource {
  async listSessions(
    params?: ListParams,
  ): Promise<PaginatedResponse<ChatSession>> {
    const body = await this.http.get("/api/v1/chat/sessions", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    });
    return parsePaginatedResponse<ChatSession>(body);
  }

  async getSession(sessionId: string): Promise<ChatSession> {
    const body = await this.http.get(`/api/v1/chat/sessions/${sessionId}`);
    return this.unwrap(body) as ChatSession;
  }

  async createSession(data: CreateChatSessionRequest): Promise<ChatSession> {
    const body = await this.http.post(
      "/api/v1/chat/sessions",
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as ChatSession;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.http.delete(`/api/v1/chat/sessions/${sessionId}`);
  }

  async listMessages(
    sessionId: string,
    params?: ListParams,
  ): Promise<PaginatedResponse<ChatMessage>> {
    const body = await this.http.get(
      `/api/v1/chat/sessions/${sessionId}/messages`,
      {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    );
    return parsePaginatedResponse<ChatMessage>(body);
  }

  async sendMessage(
    sessionId: string,
    data: SendMessageRequest,
  ): Promise<ChatMessage> {
    const body = await this.http.post(
      `/api/v1/chat/sessions/${sessionId}/messages`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as ChatMessage;
  }
}
