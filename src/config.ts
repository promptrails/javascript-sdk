export interface Config {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
}

export interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export function resolveConfig(options: ClientOptions): Config {
  return {
    apiKey: options.apiKey,
    baseUrl: (options.baseUrl || "https://api.promptrails.ai").replace(
      /\/$/,
      "",
    ),
    timeout: options.timeout ?? 30000,
    maxRetries: options.maxRetries ?? 3,
  };
}
