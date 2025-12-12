
import { db } from '../db';
import { Account } from '../../types';
import { ValidationError, BusinessError } from '../errors';
import { handleDBError } from '../repositoryUtils';

export const getAccounts = async (): Promise<Account[]> => {
    try {
        return await db.accounts.toArray();
    } catch (e) {
        throw handleDBError(e, 'DB_READ_ERROR');
    }
};

export const postAccount = async (account: Account): Promise<void> => {
    try {
        if (!account.name.trim()) {
            throw new ValidationError('Account name required', 'VALIDATION_REQUIRED_FIELD');
        }
        await db.accounts.put(account);
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
