import { ErrorResponseSchema, type ErrorResponse } from "@deskaway/shared";

// Parses an API error body, so a wrong shape fails the test too.
export function errorOf(response: {
  json: () => unknown;
}): ErrorResponse["error"] {
  return ErrorResponseSchema.parse(response.json()).error;
}
