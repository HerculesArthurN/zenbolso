import { db } from '../db';
import { Category } from '../../types';
import { handleDBError } from '../repositoryUtils';

export const getCategories = async (): Promise<Category[]> => {
    try {
        return await db.categories.toArray();
    } catch (e) {
        throw handleDBError(e, 'DB_READ_ERROR');
    }
};

export const postCategory = async (category: Category): Promise<void> => {
    try {
        // Check duplicates
        const existing = await db.categories
            .where('name').equals(category.name)
            .and(c => c.type === category.type)
            .first();
            
        if (!existing) {
            await db.categories.put(category);
        }
    } catch (e) {
        throw handleDBError(e, 'DB_WRITE_ERROR');
    }
};

export const removeCategory = async (id: string): Promise<void> => {
    try {
        await db.categories.delete(id);
    } catch (e) {
        throw handleDBError(e, 'DB_DELETE_ERROR');
    }
};