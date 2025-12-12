export class AppError extends Error {
  public readonly code: string;
  public readonly details?: any;

  constructor(code: string, message: string = 'Erro na aplicação', details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'AppError';
    
    // Mantém o stack trace correto no V8 (Chrome/Node)
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, AppError);
    }
  }
}