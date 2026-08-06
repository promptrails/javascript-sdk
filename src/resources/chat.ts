import { PaginatedResponse, parsePaginatedResponse } from "../pagination";
import { parseSSEStream } from "../sse";
import {
  ChatSession,
  ChatMessage,
  ChatFeedbackRequest,
  ChatFeedbackResponse,
  CreateChatSessionRequest,
  SendMessageRequest,
  ListParams,
  StreamEvent,
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

  /**
   * Submit or update thumbs-up/down feedback for an execution in this
   * session. Repeating the call for the same execution updates the score.
   */
  async submitFeedback(
    sessionId: string,
    data: ChatFeedbackRequest,
  ): Promise<ChatFeedbackResponse> {
    const body = await this.http.post(
      `/api/v1/chat/sessions/${sessionId}/feedback`,
      data as unknown as Record<string, unknown>,
    );
    return this.unwrap(body) as ChatFeedbackResponse;
  }

  /**
   * Send a message and stream the agent's execution events on the same
   * connection. The generator yields typed StreamEvents — begin by handling
   * "execution" (you get the execution_id) and end on "done" or "error".
   *
   * Abort by calling the returned AbortController.abort() or pass a signal.
   */
  async *sendMessageStream(
    sessionId: string,
    data: SendMessageRequest,
    options?: { signal?: AbortSignal },
  ): AsyncGenerator<StreamEvent> {
    const response = await this.http.stream(
      "POST",
      `/api/v1/chat/sessions/${sessionId}/messages/stream`,
      {
        json: data as unknown as Record<string, unknown>,
        signal: options?.signal,
      },
    );
    yield* parseSSEStream(response, options?.signal);
  }
}
