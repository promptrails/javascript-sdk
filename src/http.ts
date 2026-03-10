import { Config } from "./config";
import { RateLimitError, ServerError, raiseForStatus } from "./errors";

export class HTTPClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async request(
    method: string,
    path: string,
    options?: {
      json?: Record<string, unknown>;
      params?: Record<string, string | number>;
    },
  ): Promise<Record<string, unknown>> {
    let url = `${this.config.baseUrl}${path}`;

    if (options?.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const fetchOptions: RequestInit = {
          method,
          headers: {
            "X-API-Key": this.config.apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(this.config.timeout),
        };

        if (options?.json && method !== "GET") {
          fetchOptions.body = JSON.stringify(options.json);
        }

        const response = await fetch(url, fetchOptions);
        const text = await response.text();
        const body: Record<string, unknown> = text ? JSON.parse(text) : {};

        if (response.status >= 500) {
          throw new ServerError(
            (body.error as string) || "Server error",
            response.status,
          );
        }

        raiseForStatus(response.status, body);
        return body;
      } catch (err) {
        lastError = err as Error;

        if (err instanceof RateLimitError) throw err;
        if (
          err instanceof Error &&
          !(err instanceof ServerError) &&
          err.name !== "TypeError" &&
          err.name !== "AbortError"
        ) {
          throw err;
        }

        if (attempt < this.config.maxRetries) {
          await new Promise((r) =>
            setTimeout(r, Math.min(2 ** attempt * 1000, 8000)),
          );
          continue;
        }
        throw lastError;
      }
    }

    throw lastError || new Error("Request failed");
  }

  get(
    path: string,
    params?: Record<string, string | number>,
  ): Promise<Record<string, unknown>> {
    return this.request("GET", path, { params });
  }

  post(
    path: string,
    json?: Record<string, unknown>,
    params?: Record<string, string | number>,
  ): Promise<Record<string, unknown>> {
    return this.request("POST", path, { json, params });
  }

  patch(
    path: string,
    json?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.request("PATCH", path, { json });
  }

  put(
    path: string,
    json?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.request("PUT", path, { json });
  }

  delete(path: string): Promise<Record<string, unknown>> {
    return this.request("DELETE", path);
  }
}
