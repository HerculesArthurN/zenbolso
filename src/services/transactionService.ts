import { supabase } from '../lib/supabase';
import { db } from '../../services/db';
import { Transaction } from '../types';
import { handleApiError } from './api';
import { encrypt, decrypt } from '../utils/crypto';

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

            return (data || []).map(t => ({
                ...t,
                amount: Number(t.amount)
            }));
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
            amount: typeof tx.value === 'string' ? Number(decrypt(tx.value)) : tx.value,
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

        const payload = {
            ...transaction,
            amount: transaction.amount ? Number(transaction.amount) : 0
        };

        if (user) {
            const { data, error } = await supabase
                .from('transactions')
                .insert([payload])
                .select()
                .single();

            if (error) handleApiError(error);

            return {
                ...data,
                amount: Number(data.amount)
            };
        }

        // Guest Mode
        const localTx = {
            id: (payload as any).id || crypto.randomUUID(),
            type: (payload.type?.toLowerCase() || 'expense') as any,
            value: encrypt(payload.amount), // Encrypting amount as well for v2.1
            date: payload.date || new Date().toISOString().split('T')[0],
            category: payload.category_id || 'Outros',
            description: encrypt(payload.description),
            accountId: payload.account_id
        };
        await db.transactions.add(localTx as any);
        return {
            ...payload,
            id: localTx.id,
            user_id: ''
        } as Transaction;
    },

    async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
        const { data: { user } } = await supabase.auth.getUser();

        const payload = {
            ...updates,
            ...(updates.amount !== undefined && { amount: Number(updates.amount) })
        };

        if (user) {
            const { data, error } = await supabase
                .from('transactions')
                .update(payload)
                .eq('id', id)
                .select()
                .single();

            if (error) handleApiError(error);

            return {
                ...data,
                amount: Number(data.amount)
            };
        }

        // Guest Mode
        const existing = await db.transactions.get(id);
        if (!existing) throw new Error('Transaction not found');

        const localUpdate = {
            ...existing,
            ...(payload.amount !== undefined && { value: encrypt(payload.amount) }),
            ...(payload.date && { date: payload.date }),
            ...(payload.description !== undefined && { description: encrypt(payload.description) }),
            ...(payload.category_id && { category: payload.category_id }),
            ...(payload.account_id && { accountId: payload.account_id }),
            ...(payload.type && { type: payload.type.toLowerCase() as any })
        };
        await db.transactions.put(localUpdate as any);
        return {
            ...payload,
            id,
            description: updates.description ?? decrypt((existing as any).description),
            amount: updates.amount ?? (typeof (existing as any).value === 'string' ? Number(decrypt((existing as any).value)) : (existing as any).value)
        } as Transaction;
    },

    async deleteTransaction(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) handleApiError(error);
            return;
        }

        await db.transactions.delete(id);
    }
};

