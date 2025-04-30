// A custom error class for handling application-specific errors.
// Allows specifying an HTTP status code and a message for each error.

export class AppError extends Error {
  public statusCode: number;
  public context: Record<string, unknown>;

  constructor(message: string, statusCode: number = 500, context: Record<string, unknown> = {}) {
    super(message); // Assigns the error message to the base Error class

    this.statusCode = statusCode; // HTTP status code associated with the error
    this.context = context; // Additional context for debugging

    Error.captureStackTrace(this, this.constructor); // Ensures the stack trace doesn't include this class
  }
}
