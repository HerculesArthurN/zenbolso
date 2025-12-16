import { db } from '../db';
import { Transaction } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { handleDBError } from '../repositoryUtils';

export const TransactionRepository = {
  /**
   * Busca transações com filtro opcional de data.
   * Se datas forem fornecidas, usa Index Range Scan (rápido).
   */
  findAll: async (filter?: { start?: string; end?: string }): Promise<Transaction[]> => {
    try {
      if (filter?.start && filter?.end) {
        return await db.transactions
          .where('date')
          .between(filter.start, filter.end, true, true) // true = inclusivo
          .reverse()
          .toArray();
      }
      return await db.transactions.orderBy('date').reverse().toArray();
    } catch (error) {
      throw handleDBError(error, 'DB_READ_ERROR');
    }
  },

  /**
   * Cria uma nova transação gerando o ID automaticamente.
   */
  create: async (data: Omit<Transaction, 'id'>): Promise<string> => {
    try {
      const id = uuidv4();
      const transaction: Transaction = { ...data, id };
      await db.transactions.add(transaction);
      return id;
    } catch (error) {
      throw handleDBError(error, 'DB_WRITE_ERROR');
    }
  },

  /**
   * Atualiza uma transação existente.
   */
  update: async (transaction: Transaction): Promise<void> => {
    try {
      await db.transactions.put(transaction);
    } catch (error) {
      throw handleDBError(error, 'DB_WRITE_ERROR');
    }
  },

  /**
   * Remove uma transação pelo ID.
   */
  delete: async (id: string): Promise<void> => {
    try {
      await db.transactions.delete(id);
    } catch (error) {
      throw handleDBError(error, 'DB_DELETE_ERROR');
    }
  }
};