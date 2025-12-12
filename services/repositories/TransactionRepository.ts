import { db } from '../db';
import { Transaction } from '../../types';
import { ValidationError } from '../errors';
import { handleDBError } from '../repositoryUtils';

export class TransactionRepository {
  /**
   * Busca todas as transações ordenadas por data (descendente)
   */
  static async getAll(): Promise<Transaction[]> {
    try {
      return await db.transactions.orderBy('date').reverse().toArray();
    } catch (e) {
      throw handleDBError(e, 'DB_READ_ERROR');
    }
  }

  /**
   * Busca transações dentro de um intervalo de datas (Index Range Scan)
   * Muito mais performático que filtrar arrays em memória.
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      return await db.transactions
        .where('date')
        .between(startDate, endDate, true, true) // true = inclusivo
        .reverse()
        .toArray();
    } catch (e) {
      throw handleDBError(e, 'DB_READ_ERROR');
    }
  }

  static async add(transaction: Transaction): Promise<void> {
    try {
      if (!transaction.value || transaction.value <= 0) {
        throw new ValidationError('Value must be positive', 'VALIDATION_INVALID_VALUE');
      }
      if (!transaction.category) {
        throw new ValidationError('Category is required', 'VALIDATION_NO_CATEGORY');
      }
      
      // Fallback para conta padrão se não fornecida
      if (!transaction.accountId) {
          const firstAccount = await db.accounts.toCollection().first();
          if (firstAccount) {
              transaction.accountId = firstAccount.id;
          } else {
              throw new ValidationError('No account available', 'VALIDATION_NO_ACCOUNT');
          }
      }

      await db.transactions.add(transaction);
    } catch (e) {
      throw handleDBError(e, 'DB_WRITE_ERROR');
    }
  }

  static async update(transaction: Transaction): Promise<void> {
    try {
      await db.transactions.put(transaction);
    } catch (e) {
      throw handleDBError(e, 'DB_WRITE_ERROR');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await db.transactions.delete(id);
    } catch (e) {
      throw handleDBError(e, 'DB_DELETE_ERROR');
    }
  }
}