import { db } from '../db';
import { RecurringConfig } from '../../types';
import { handleDBError } from '../repositoryUtils';

export const getRecurringConfigs = async (): Promise<RecurringConfig[]> => {
    try {
        return await db.recurringConfigs.toArray();
    } catch (e) {
        throw handleDBError(e, 'DB_READ_ERROR');
    }
};

export const postRecurringConfig = async (config: RecurringConfig): Promise<void> => {
    try {
        await db.recurringConfigs.put(config);
    } catch (e) {
        throw handleDBError(e, 'DB_WRITE_ERROR');
    }
};

export const removeRecurringConfig = async (id: string): Promise<void> => {
    try {
        await db.recurringConfigs.delete(id);
    } catch (e) {
        throw handleDBError(e, 'DB_DELETE_ERROR');
    }
};

export const updateRecurringConfigApi = async (config: RecurringConfig): Promise<void> => {
    try {
        await db.recurringConfigs.put(config);
    } catch (e) {
        throw handleDBError(e, 'DB_WRITE_ERROR');
    }
};