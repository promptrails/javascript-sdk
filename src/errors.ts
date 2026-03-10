export class PromptRailsError extends Error {
  public readonly statusCode?: number;
  public readonly code?: string;
  public readonly details: Record<string, unknown>;

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "PromptRailsError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details || {};
  }
}

export class ValidationError extends PromptRailsError {
  constructor(
    message: string,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message, 400, code, details);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends PromptRailsError {
  constructor(
    message: string,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message, 401, code, details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends PromptRailsError {
  constructor(
    message: string,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message, 403, code, details);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends PromptRailsError {
  constructor(
    message: string,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message, 404, code, details);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends PromptRailsError {
  constructor(
    message: string,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message, 429, code, details);
    this.name = "RateLimitError";
  }
}

export class ServerError extends PromptRailsError {
  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message, statusCode, code, details);
    this.name = "ServerError";
  }
}

const STATUS_MAP: Record<
  number,
  new (
    message: string,
    code?: string,
    details?: Record<string, unknown>,
  ) => PromptRailsError
> = {
  400: ValidationError,
  401: UnauthorizedError,
  403: ForbiddenError,
  404: NotFoundError,
  429: RateLimitError,
};

export function raiseForStatus(
  statusCode: number,
  body: Record<string, unknown>,
): void {
  if (statusCode >= 200 && statusCode < 300) return;

  const errorData = body.error as
    | string
    | { message?: string; code?: string; details?: Record<string, unknown> }
    | undefined;

  let message: string;
  let code: string | undefined;
  let details: Record<string, unknown> = {};

  if (typeof errorData === "string") {
    message = errorData;
  } else if (errorData && typeof errorData === "object") {
    message = errorData.message || (body.message as string) || "Unknown error";
    code = errorData.code;
    details = errorData.details || {};
  } else {
    message = (body.message as string) || "Unknown error";
  }

  const ErrorClass = STATUS_MAP[statusCode];
  if (ErrorClass) {
    throw new ErrorClass(message, code, details);
  }
  throw new ServerError(message, statusCode, code, details);
}
