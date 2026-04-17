import type { StreamEvent, TokenUsage } from "./types";

/**
 * Parse a text/event-stream response body into typed StreamEvents.
 *
 * Frames follow the `event: <name>\ndata: <json>\n\n` convention the backend
 * emits. Unknown event names are skipped silently so a future server can add
 * new event types without breaking older clients.
 */
export async function* parseSSEStream(
  response: Response,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  // Frame headers persist across reads so a single event can span chunks.
  let currentEvent = "";
  let currentData = "";

  try {
    while (true) {
      if (signal?.aborted) break;

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          currentData = line.slice(5).trim();
        } else if (line === "") {
          if (currentData) {
            const event = parseEvent(currentEvent, currentData);
            if (event) yield event;
          }
          currentEvent = "";
          currentData = "";
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function parseEvent(name: string, data: string): StreamEvent | null {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }

  switch (name) {
    case "execution":
      if (typeof parsed.execution_id === "string") {
        return {
          type: "execution",
          executionId: parsed.execution_id,
          userMessageId:
            typeof parsed.user_message_id === "string"
              ? parsed.user_message_id
              : undefined,
        };
      }
      return null;

    case "thinking":
      if (typeof parsed.content === "string") {
        return { type: "thinking", content: parsed.content };
      }
      return null;

    case "tool_start":
      if (typeof parsed.id === "string" && typeof parsed.name === "string") {
        return { type: "tool_start", id: parsed.id, name: parsed.name };
      }
      return null;

    case "tool_end":
      if (typeof parsed.id === "string" && typeof parsed.name === "string") {
        return {
          type: "tool_end",
          id: parsed.id,
          name: parsed.name,
          summary:
            typeof parsed.summary === "string" ? parsed.summary : undefined,
        };
      }
      return null;

    case "content":
      if (typeof parsed.content === "string") {
        return { type: "content", content: parsed.content };
      }
      return null;

    case "done":
      return {
        type: "done",
        output: parsed.output,
        tokenUsage: parsed.token_usage as TokenUsage | undefined,
      };

    case "error": {
      const msg =
        (typeof parsed.message === "string" && parsed.message) ||
        (typeof parsed.error === "string" && parsed.error) ||
        "stream error";
      return { type: "error", message: msg };
    }

    default:
      return null;
  }
}
