import { db } from './db';
import { Account, DexieAccount, AccountType } from '../types';
import { decrypt } from '../utils/crypto';

export const accountService = {
    async fetchAccounts(): Promise<Account[]> {
        const [localAccounts, localTransactions] = await Promise.all([
            db.accounts.toArray(),
            db.transactions.toArray()
        ]);

        return localAccounts.map((acc: DexieAccount) => {
            const accountTransactions = localTransactions.filter((t) => t.accountId === acc.id || (!t.accountId && acc.id === 'default-wallet'));

            const flow = accountTransactions.reduce((sum: number, t) => {
                const rawValue = typeof t.value === 'string' ? decrypt(t.value) : t.value;
                const val = Number(rawValue) || 0;
                const type = String(t.type || '').toUpperCase();
                return sum + (type === 'INCOME' ? val : (type === 'EXPENSE' ? -val : 0));
            }, 0);

            return {
                id: acc.id,
                user_id: '',
                name: acc.name,
                balance: (Number(acc.initialBalance) || 0) + flow,
                type: this.mapLegacyType(acc.type),
                color: acc.color,
                is_archived: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
        });
    },

    mapLegacyType(type: string): AccountType {
        const t = type.toUpperCase();
        if (t === 'WALLET' || t === 'BANK' || t === 'INVESTMENT') return t as AccountType;

        const map: Record<string, string> = {
            'CHECKING': 'BANK',
            'SAVINGS': 'BANK',
            'INVESTMENT': 'INVESTMENT',
            'CASH': 'WALLET',
            'CREDIT': 'BANK'
        };
        return (map[t] || 'BANK') as AccountType;
    },

    async createAccount(account: Partial<Account>): Promise<Account> {
        const localAccount: DexieAccount = {
            id: account.id || crypto.randomUUID(),
            name: account.name || 'Nova Conta',
            type: 'checking',
            initialBalance: account.balance || 0,
            color: account.color || '#6366f1'
        };
        await db.accounts.add(localAccount);
        return {
            id: localAccount.id,
            user_id: '',
            name: localAccount.name,
            balance: localAccount.initialBalance,
            type: this.mapLegacyType(localAccount.type),
            color: localAccount.color,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    },

    async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
        const existing = await db.accounts.get(id);
        if (!existing) throw new Error('Account not found');
        const localUpdate: DexieAccount = {
            ...existing,
            ...(updates.name && { name: updates.name }),
            ...(updates.balance !== undefined && { initialBalance: updates.balance }),
            ...(updates.color && { color: updates.color })
        };
        await db.accounts.put(localUpdate);
        return {
            id: existing.id,
            user_id: '',
            name: localUpdate.name,
            balance: localUpdate.initialBalance,
            type: this.mapLegacyType(localUpdate.type),
            color: localUpdate.color,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    },

    async deleteAccount(id: string): Promise<void> {
        const count = await db.transactions.where('accountId').equals(id).count();
        if (count > 0) {
            throw new Error('HAS_DATA');
        }

        await db.accounts.delete(id);
    }
};
