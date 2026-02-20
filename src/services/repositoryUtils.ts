
import Dexie from 'dexie';
import { StorageError, ServiceError } from './errors';

export const handleDBError = (error: unknown, defaultCode: string = 'DB_WRITE_ERROR'): never => {
  console.error(`DB Error [${defaultCode}]:`, error);

  if (error instanceof ServiceError) {
      throw error;
  }

  if (error instanceof Dexie.QuotaExceededError) {
    throw new StorageError('Storage quota exceeded', 'DB_QUOTA_EXCEEDED', error);
  }

  if (error instanceof Dexie.ConstraintError) {
      throw new StorageError('Constraint violation', 'DB_CONSTRAINT_ERROR', error);
  }

  throw new StorageError((error as Error).message || 'Unknown DB Error', defaultCode, error);
};
