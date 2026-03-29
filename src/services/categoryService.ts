import { db } from './db';
import { Category } from '../types';

export const categoryService = {
    async fetchCategories(): Promise<Category[]> {
        const localCats = await db.categories.toArray();
        return localCats.map(cat => ({
            id: cat.id,
            user_id: '',
            name: cat.name,
            icon: cat.icon || 'Tag',
            type: cat.type.toUpperCase() as any,
            color: cat.color || '#94a3b8',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));
    },

    async createCategory(category: Partial<Category>): Promise<Category> {
        const localCat = {
            id: category.id || crypto.randomUUID(),
            name: category.name || 'Nova Categoria',
            icon: category.icon || 'Tag',
            type: category.type || 'EXPENSE',
            color: category.color || '#94a3b8'
        };
        await db.categories.add(localCat as any);
        return {
            ...localCat,
            user_id: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as Category;
    },

    async deleteCategory(id: string): Promise<void> {
        const count = await db.transactions.where('category').equals(id).count();
        if (count > 0) {
            throw new Error('HAS_DATA');
        }

        await db.categories.delete(id);
    }
};
