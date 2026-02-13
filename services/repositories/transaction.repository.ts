import { db } from '../db';
import { Transaction } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { handleDBError } from '../repositoryUtils';
import { decrypt, encrypt } from '../../src/utils/crypto';
import { safeNumber } from '../../src/utils/numberUtils';

export const TransactionRepository = {
  /**
   * Busca transações com filtro opcional de data.
   * Se datas forem fornecidas, usa Index Range Scan (rápido).
   */
  findAll: async (filter?: { start?: string; end?: string }): Promise<Transaction[]> => {
    try {
      let data: any[];
      if (filter?.start && filter?.end) {
        data = await db.transactions
          .where('date')
          .between(filter.start, filter.end, true, true)
          .reverse()
          .toArray();
      } else {
        data = await db.transactions.orderBy('date').reverse().toArray();
      }

      // Descriptografa e garante tipos numéricos antes de retornar para a UI
      return data.map(tx => ({
        ...tx,
        value: safeNumber(decrypt(tx.value)),
        description: decrypt(tx.description),
        category: decrypt(tx.category) // Algumas categorias antigas podiam estar criptografadas
      }));
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
      const transaction: any = {
        ...data,
        id,
        value: encrypt(data.value),
        description: encrypt(data.description),
        category: data.category // Categorias normalmente salvamos texto puro para filtros no DB
      };
      await db.transactions.add(transaction);
      return id;
    } catch (error) {
      throw handleDBError(error, 'DB_WRITE_ERROR');
    }
  },

  /**
   * Salva uma transação que já possui ID (útil para lógica de negócios que gera IDs).
   */
  add: async (transaction: Transaction): Promise<void> => {
    try {
      const encryptedTx = {
        ...transaction,
        value: encrypt(transaction.value),
        description: encrypt(transaction.description)
      };
      await db.transactions.add(encryptedTx as any);
    } catch (error) {
      throw handleDBError(error, 'DB_WRITE_ERROR');
    }
  },

  /**
   * Atualiza uma transação existente.
   */
  update: async (transaction: Transaction): Promise<void> => {
    try {
      const encryptedTx = {
        ...transaction,
        value: encrypt(transaction.value),
        description: encrypt(transaction.description)
      };
      await db.transactions.put(encryptedTx as any);
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