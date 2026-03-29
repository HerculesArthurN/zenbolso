import { db } from './db';
import { Account } from '../types';
import { decrypt } from '../utils/crypto';

export const accountService = {
    async fetchAccounts(): Promise<Account[]> {
        const [localAccounts, localTransactions] = await Promise.all([
            db.accounts.toArray(),
            db.transactions.toArray()
        ]);

        return localAccounts.map((acc: any) => {
            const accountTransactions = localTransactions.filter((t: any) => t.accountId === acc.id || (!t.accountId && acc.id === 'default-wallet'));

            const flow = accountTransactions.reduce((sum: number, t: any) => {
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

    mapLegacyType(type: string): any {
        const t = type.toUpperCase();
        if (['WALLET', 'BANK', 'INVESTMENT'].includes(t)) return t;

        const map: Record<string, string> = {
            'CHECKING': 'BANK',
            'SAVINGS': 'BANK',
            'INVESTMENT': 'INVESTMENT',
            'CASH': 'WALLET',
            'CREDIT': 'BANK'
        };
        return map[t] || 'BANK';
    },

    async createAccount(account: Partial<Account>): Promise<Account> {
        const localAccount = {
            id: account.id || crypto.randomUUID(),
            name: account.name || 'Nova Conta',
            type: 'checking' as any,
            initialBalance: account.balance || 0,
            color: account.color || '#6366f1'
        };
        await db.accounts.add(localAccount as any);
        return {
            ...account,
            id: localAccount.id,
            user_id: '',
            balance: localAccount.initialBalance,
            type: this.mapLegacyType(localAccount.type),
            color: localAccount.color,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as Account;
    },

    async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
        const existing = await db.accounts.get(id);
        if (!existing) throw new Error('Account not found');
        const localUpdate = {
            ...existing,
            ...(updates.name && { name: updates.name }),
            ...(updates.balance !== undefined && { initialBalance: updates.balance }),
            ...(updates.color && { color: updates.color })
        };
        await db.accounts.put(localUpdate);
        return { ...updates, id } as Account;
    },

    async deleteAccount(id: string): Promise<void> {
        const count = await db.transactions.where('accountId').equals(id).count();
        if (count > 0) {
            throw new Error('HAS_DATA');
        }

        await db.accounts.delete(id);
    }
};
