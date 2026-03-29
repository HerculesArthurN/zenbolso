
import { db } from '../db';
import { Account } from '../../types';
import { ValidationError, BusinessError } from '../errors';
import { handleDBError } from '../repositoryUtils';

export const getAccounts = async (): Promise<Account[]> => {
    try {
        const localAccounts = await db.accounts.toArray();
        return localAccounts.map(acc => ({
            id: acc.id,
            user_id: '',
            name: acc.name,
            balance: acc.initialBalance,
            type: (acc.type || 'BANK').toUpperCase() as Account['type'],
            color: acc.color,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));
    } catch (e) {
        throw handleDBError(e, 'DB_READ_ERROR');
    }
};

export const postAccount = async (account: Account): Promise<void> => {
    try {
        if (!account.name.trim()) {
            throw new ValidationError('Account name required', 'VALIDATION_REQUIRED_FIELD');
        }
        await db.accounts.put({
            id: account.id,
            name: account.name,
            initialBalance: account.balance,
            type: account.type,
            color: account.color || '#6366f1'
        });
    } catch (e) {
        throw handleDBError(e, 'DB_WRITE_ERROR');
    }
};

export const removeAccount = async (id: string): Promise<void> => {
    try {
        // Check if it's the last one
        const count = await db.accounts.count();
        if (count <= 1) {
            throw new BusinessError('Cannot delete the last account', 'BUSINESS_LAST_ACCOUNT_DELETE');
        }
        await db.accounts.delete(id);
    } catch (e) {
        throw handleDBError(e, 'DB_DELETE_ERROR');
    }
};
