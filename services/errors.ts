
export class ServiceError extends Error {
  constructor(message: string, public code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'ServiceError';
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, code);
    this.name = 'ValidationError';
  }
}

export class StorageError extends ServiceError {
  constructor(message: string, code: string = 'DB_WRITE_ERROR', public originalError?: unknown) {
    super(message, code);
    this.name = 'StorageError';
  }
}

export class BusinessError extends ServiceError {
  constructor(message: string, code: string) {
    super(message, code);
    this.name = 'BusinessError';
  }
}

export class NotFoundError extends ServiceError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}
