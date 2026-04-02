/**
 * Custom API error class for standardized error handling.
 * Extends the native Error class with an HTTP status code.
 */
export class ApiError extends Error {
  public readonly code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    this.name = "ApiError";

    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /** 400 Bad Request */
  static badRequest(message: string = "Bad request"): ApiError {
    return new ApiError(message, 400);
  }

  /** 401 Unauthorized */
  static unauthorized(message: string = "Unauthorized"): ApiError {
    return new ApiError(message, 401);
  }

  /** 403 Forbidden */
  static forbidden(message: string = "Forbidden"): ApiError {
    return new ApiError(message, 403);
  }

  /** 404 Not Found */
  static notFound(message: string = "Resource not found"): ApiError {
    return new ApiError(message, 404);
  }

  /** 422 Unprocessable Entity */
  static validationError(message: string = "Validation failed"): ApiError {
    return new ApiError(message, 422);
  }

  /** 500 Internal Server Error */
  static internal(message: string = "Internal server error"): ApiError {
    return new ApiError(message, 500);
  }
}
