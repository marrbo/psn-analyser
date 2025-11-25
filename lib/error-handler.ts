// lib/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database error') {
    super(message, 503);
    this.name = 'DatabaseError';
  }
}

export class PSNServiceError extends AppError {
  constructor(message: string = 'PSN service error') {
    super(message, 502);
    this.name = 'PSNServiceError';
  }
}

export class UserNotFoundError extends AppError {
  constructor(username: string) {
    super(`User '${username}' not found on PSN`, 404);
    this.name = 'UserNotFoundError';
  }
}

export function handleError(error: unknown): { message: string; statusCode: number } {
  console.error('🔴 Error handled:', error);

  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode
    };
  }

  if (error instanceof Error) {
    // Erros de rede ou MongoDB
    if (error.message.includes('Mongo') || error.message.includes('ECONNREFUSED')) {
      return {
        message: 'Database service is temporarily unavailable. Please try again later.',
        statusCode: 503
      };
    }

    // Erros de API PSN
    if (error.message.includes('PSN') || error.message.includes('trophy')) {
      return {
        message: 'PSN service is temporarily unavailable. Please try again later.',
        statusCode: 502
      };
    }
  }

  // Erro genérico
  return {
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: 500
  };
}