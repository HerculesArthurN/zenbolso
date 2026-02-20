
import { db } from '../db';
import { AppSettings, Transaction } from '../../types';
import { ValidationError } from '../errors';
import { handleDBError } from '../repositoryUtils';

export const getSettings = async (): Promise<AppSettings> => {
    try {
        const settings = await db.settings.get('global_settings');
        return settings || { budgetLimit: 0, monthlyIncome: 0, workHoursPerMonth: 160 };
    } catch (e) {
        console.error("Failed to load settings, using defaults");
        return { budgetLimit: 0, monthlyIncome: 0, workHoursPerMonth: 160 };
    }
};

export const updateSettings = async (settings: AppSettings): Promise<void> => {
    try {
        await db.settings.put({ ...settings, id: 'global_settings' });
    } catch (e) {
        throw handleDBError(e, 'DB_WRITE_ERROR');
    }
};

export const clearAllData = async (): Promise<void> => {
    try {
        await Promise.all([
            db.transactions.clear(),
            db.accounts.clear(),
            db.categories.clear(),
            db.recurringConfigs.clear(),
            db.settings.clear(),
            db.goals.clear()
        ]);

        const now = new Date().toISOString();
        const defaultAccount: any = {
            id: 'default-wallet',
            user_id: 'local',
            name: 'Carteira',
            type: 'WALLET',
            balance: 0,
            color: '#10b981',
            is_archived: false,
            created_at: now,
            updated_at: now
        };
        await db.accounts.add(defaultAccount);
    } catch (e) {
        throw handleDBError(e, 'DB_DELETE_ERROR');
    }
};

export const importData = async (transactions: Transaction[]): Promise<void> => {
    try {
        if (!transactions || transactions.length === 0) {
            throw new ValidationError('No transactions to import', 'IMPORT_NO_VALID_DATA');
        }
        await db.transactions.bulkPut(transactions);
    } catch (e) {
        throw handleDBError(e, 'DB_WRITE_ERROR');
    }
};
