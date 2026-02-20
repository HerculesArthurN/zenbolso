import { db } from './db';
import { Transaction } from '../types';
import { encrypt, decrypt } from '../utils/crypto';

export const transactionService = {
    async fetchTransactions(limit = 50): Promise<Transaction[]> {
        // Local Mode: Fetch directly from Dexie
        const localTxs = await db.transactions
            .orderBy('date')
            .reverse()
            .limit(limit)
            .toArray();

        return localTxs.map((tx: any) => ({
            id: tx.id,
            user_id: '', // Deprecated
            account_id: tx.accountId || '',
            category_id: tx.category || null,
            amount: (() => {
                if (typeof tx.value === 'string') {
                    const decrypted = decrypt(tx.value);
                    return decrypted ? Number(decrypted) : 0;
                }
                return Number(tx.value) || 0;
            })(),
            description: decrypt(tx.description || ''),
            date: tx.date,
            type: tx.type.toUpperCase() as any,
            is_paid: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }));
    },

    async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
        const id = transaction.id || crypto.randomUUID();
        const now = new Date().toISOString();

        // Standardized internal payload for Dexie
        const localTx = {
            id,
            type: (transaction.type?.toUpperCase() || 'EXPENSE') as any,
            value: encrypt(transaction.amount ? Number(transaction.amount) : 0),
            date: transaction.date || now.split('T')[0],
            category: transaction.category_id || 'Outros',
            description: encrypt(transaction.description || ''),
            accountId: transaction.account_id
        };

        // Save locally
        await db.transactions.put(localTx as any);

        return {
            id,
            user_id: '',
            account_id: transaction.account_id || '',
            category_id: transaction.category_id || '',
            amount: transaction.amount ? Number(transaction.amount) : 0,
            description: transaction.description || '',
            date: transaction.date || now.split('T')[0],
            type: transaction.type || 'EXPENSE',
            is_paid: true,
            created_at: now,
            updated_at: now
        } as Transaction;
    },

    async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
        // Apply updates to Dexie locally
        const existing = await db.transactions.get(id);

        if (existing) {
            const localUpdate: any = {
                ...existing,
                ...(updates.amount !== undefined && { value: encrypt(updates.amount) }),
                ...(updates.date && { date: updates.date }),
                ...(updates.description !== undefined && { description: encrypt(updates.description) }),
                ...(updates.category_id !== undefined && { category: updates.category_id }),
                ...(updates.account_id !== undefined && { accountId: updates.account_id }),
                ...(updates.type && { type: updates.type.toLowerCase() as any })
            };
            await db.transactions.put(localUpdate);
        }

        // Reconstruct for UI
        return {
            id,
            ...updates,
            description: updates.description ?? (existing ? decrypt((existing as any).description) : ''),
            amount: updates.amount ?? (existing ? (() => {
                const val = (existing as any).value;
                if (typeof val === 'string') {
                    const decrypted = decrypt(val);
                    return decrypted ? Number(decrypted) : 0;
                }
                return Number(val) || 0;
            })() : 0)
        } as any;
    },

    async deleteTransaction(id: string): Promise<void> {
        // Delete locally
        await db.transactions.delete(id);
    }
};

