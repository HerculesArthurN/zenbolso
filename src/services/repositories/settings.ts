
import { db } from '../db';
import { AppSettings, Transaction, DexieTransaction, DexieAccount } from '../../types';
import { ValidationError } from '../errors';
import { handleDBError } from '../repositoryUtils';
import { encrypt } from '../../utils/crypto';

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

        const defaultAccount: DexieAccount = {
            id: 'default-wallet',
            name: 'Carteira',
            initialBalance: 0,
            type: 'WALLET',
            color: '#10b981'
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
        
        const dexieTxs: DexieTransaction[] = transactions.map(t => ({
            id: t.id,
            type: t.type || 'EXPENSE',
            value: encrypt(t.amount ? Number(t.amount) : 0),
            date: t.date,
            category: t.category_id || 'Outros',
            description: encrypt(t.description || ''),
            accountId: t.account_id || ''
        }));
        
        await db.transactions.bulkPut(dexieTxs);
    } catch (e) {
        throw handleDBError(e, 'DB_WRITE_ERROR');
    }
};
