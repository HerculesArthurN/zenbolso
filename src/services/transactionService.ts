import { supabase } from '../lib/supabase';
import { db } from '../../services/db';
import { Transaction } from '../types';
import { handleApiError } from './api';
import { encrypt, decrypt } from '../utils/crypto';
import { SyncQueue } from './sync/SyncQueue';
import { SyncProcessor } from './sync/SyncProcessor';

export const transactionService = {
    async fetchTransactions(limit = 50): Promise<Transaction[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })
                .limit(limit);

            if (error) handleApiError(error);

            const transactions = (data || []).map(t => ({
                ...t,
                amount: Number(t.amount)
            }));

            // Sync potentially missing local transactions from remote (optional but good for consistency)
            // For now, we just return them.
            return transactions;
        }

        // Guest Mode: Fetch from Dexie
        const localTxs = await db.transactions
            .orderBy('date')
            .reverse()
            .limit(limit)
            .toArray();

        return localTxs.map(tx => ({
            id: tx.id,
            user_id: '',
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
        const { data: { user } } = await supabase.auth.getUser();

        const id = transaction.id || crypto.randomUUID();
        const now = new Date().toISOString();

        // Standardized payload for Supabase
        const supabasePayload = {
            id,
            user_id: user?.id || '',
            account_id: transaction.account_id,
            category_id: transaction.category_id,
            amount: transaction.amount ? Number(transaction.amount) : 0,
            description: transaction.description || '',
            date: transaction.date || now.split('T')[0],
            type: transaction.type || 'EXPENSE',
            is_paid: transaction.is_paid ?? true,
            created_at: now,
            updated_at: now
        };

        // Standardized internal payload for Dexie (legacy format compatibility)
        const localTx = {
            id,
            type: (supabasePayload.type.toLowerCase()) as any,
            value: encrypt(supabasePayload.amount),
            date: supabasePayload.date,
            category: supabasePayload.category_id || 'Outros',
            description: encrypt(supabasePayload.description),
            accountId: supabasePayload.account_id
        };

        // 1. Save locally (Optimistic)
        await db.transactions.put(localTx as any);

        // 2. If authenticated, queue for sync
        if (user) {
            await SyncQueue.enqueue({
                type: 'create',
                entity: 'transactions',
                entity_id: id,
                payload: supabasePayload
            });
            // 3. Trigger processor
            SyncProcessor.process().catch(console.error);
        }

        return {
            ...supabasePayload,
            amount: Number(supabasePayload.amount)
        } as Transaction;
    },

    async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Apply updates to Dexie locally (Optimistic)
        const existing = await db.transactions.get(id);

        let localUpdate: any;
        if (existing) {
            localUpdate = {
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

        // 2. If authenticated, queue for sync
        if (user) {
            const supabaseUpdates = {
                ...(updates.amount !== undefined && { amount: Number(updates.amount) }),
                ...(updates.description !== undefined && { description: updates.description }),
                ...(updates.date && { date: updates.date }),
                ...(updates.category_id !== undefined && { category_id: updates.category_id }),
                ...(updates.account_id !== undefined && { account_id: updates.account_id }),
                ...(updates.type && { type: updates.type }),
                updated_at: new Date().toISOString()
            };

            await SyncQueue.enqueue({
                type: 'update',
                entity: 'transactions',
                entity_id: id,
                payload: supabaseUpdates
            });
            // 3. Trigger processor
            SyncProcessor.process().catch(console.error);
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
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Delete locally (Optimistic)
        await db.transactions.delete(id);

        // 2. If authenticated, queue for sync
        if (user) {
            await SyncQueue.enqueue({
                type: 'delete',
                entity: 'transactions',
                entity_id: id,
                payload: {}
            });
            // 3. Trigger processor
            SyncProcessor.process().catch(console.error);
        }
    }
};
