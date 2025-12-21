
import { db } from '../db';
import { Transaction } from '../../types';
import { ValidationError } from '../errors';
import { handleDBError } from '../repositoryUtils';

export const getTransactions = async (): Promise<Transaction[]> => {
    try {
        return await db.transactions.orderBy('date').reverse().toArray();
    } catch (e) {
        throw handleDBError(e, 'DB_READ_ERROR');
    }
};

export const postTransaction = async (transaction: Transaction): Promise<void> => {
    try {
        // Validações básicas antes de ir ao banco
        if (!transaction.value || transaction.value <= 0) {
            throw new ValidationError('Value must be positive', 'VALIDATION_INVALID_VALUE');
        }
        if (!transaction.category) {
            throw new ValidationError('Category is required', 'VALIDATION_NO_CATEGORY');
        }

        // Check account
        if (!transaction.accountId) {
            const firstAccount = await db.accounts.toCollection().first();
            if (firstAccount) {
                transaction.accountId = firstAccount.id;
            } else {
                throw new ValidationError('No account available', 'VALIDATION_NO_ACCOUNT');
            }
        }
        await db.transactions.put(transaction);
    } catch (e) {
        throw handleDBError(e, 'DB_WRITE_ERROR');
    }
};

export const updateTransaction = async (transaction: Transaction): Promise<void> => {
    try {
        await db.transactions.put(transaction);
    } catch (e) {
        throw handleDBError(e, 'DB_WRITE_ERROR');
    }
};

export const removeTransaction = async (id: string): Promise<void> => {
    try {
        await db.transactions.delete(id);
    } catch (e) {
        throw handleDBError(e, 'DB_DELETE_ERROR');
    }
};

export const clearAllTransactions = async (): Promise<void> => {
    try {
        await db.transactions.clear();
    } catch (e) {
        throw handleDBError(e, 'DB_DELETE_ERROR');
    }
};
