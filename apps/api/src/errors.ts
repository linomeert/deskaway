// Thrown by handlers and hooks; the error handler turns it into
// { error: { code, message, details? } } with this status code.
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function notFound(what: string, id: string): AppError {
  return new AppError(404, "NOT_FOUND", `${what} ${id} not found`);
}
