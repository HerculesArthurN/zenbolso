import Dexie, { Table } from 'dexie';
import { Category, RecurringConfig, AppSettings, Goal, SyncJob, RecurringTransaction, DexieTransaction, DexieAccount } from '../types';
import { STORAGE_KEY } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// Legacy keys for migration
const RECURRING_STORAGE_KEY = 'pocket_manager_recurring_v1';
const ACCOUNTS_STORAGE_KEY = 'pocket_manager_accounts_v1';
const SETTINGS_STORAGE_KEY = 'pocket_manager_settings_v1';
const CATEGORIES_STORAGE_KEY = 'pocket_manager_categories_v1';

class PocketManagerDB extends Dexie {
    transactions!: Table<DexieTransaction, string>;
    accounts!: Table<DexieAccount, string>;
    categories!: Table<Category, string>;
    recurringConfigs!: Table<RecurringConfig, string>;
    recurring_transactions!: Table<RecurringTransaction, string>;
    settings!: Table<AppSettings & { id: string }, string>;
    goals!: Table<Goal, string>;
    sync_queue!: Table<SyncJob, number>;

    constructor() {
        super('PocketManagerDB');

        // Define Schema
        this.version(4).stores({
            transactions: 'id, date, type, category, accountId',
            accounts: 'id',
            categories: 'id, type, name',
            recurringConfigs: 'id, active',
            recurring_transactions: 'id, active, day_of_month',
            settings: 'id',
            goals: 'id',
            sync_queue: '++id, type, status, entity_id'
        });

        // Populate / Migrate Hook
        this.on('populate', async () => {
            await this.performMigrationOrSeed();
        });
    }

    async performMigrationOrSeed() {
        // Check for LocalStorage data (Legacy Migration)
        const lsTransactions = localStorage.getItem(STORAGE_KEY);
        const lsAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        const lsCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        const lsRecurring = localStorage.getItem(RECURRING_STORAGE_KEY);
        const lsSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

        // --- Accounts ---
        if (lsAccounts) {
            try {
                const data = JSON.parse(lsAccounts);
                await this.accounts.bulkAdd(data);
            } catch (e) { console.error('Migration error accounts', e) }
        } else {
            // Default Account if nothing exists
            await this.accounts.add({
                id: 'default-wallet',
                name: 'Carteira',
                initialBalance: 0,
                type: 'WALLET',
                color: '#10b981'
            });
        }

        // --- Categories (SEEDING vs MIGRATION) ---
        if (lsCategories) {
            // Migração legado
            try {
                const data = JSON.parse(lsCategories);
                await this.categories.bulkAdd(data);
            } catch (e) { console.error('Migration error categories', e) }
        } else {
            // SEEDING: Categorias Padrão "Rich Data"
            const now = new Date().toISOString();
            const defaultCategories: Category[] = [
                // Despesas
                { id: uuidv4(), user_id: 'local', name: 'Moradia', type: 'EXPENSE', icon: 'Home', color: '#00897B', created_at: now, updated_at: now },
                { id: uuidv4(), user_id: 'local', name: 'Alimentação', type: 'EXPENSE', icon: 'Utensils', color: '#D97706', created_at: now, updated_at: now },
                { id: uuidv4(), user_id: 'local', name: 'Transporte', type: 'EXPENSE', icon: 'Car', color: '#F43F5E', created_at: now, updated_at: now },
                { id: uuidv4(), user_id: 'local', name: 'Lazer', type: 'EXPENSE', icon: 'Gamepad2', color: '#6366F1', created_at: now, updated_at: now },
                { id: uuidv4(), user_id: 'local', name: 'Saúde', type: 'EXPENSE', icon: 'HeartPulse', color: '#EF4444', created_at: now, updated_at: now },
                { id: uuidv4(), user_id: 'local', name: 'Educação', type: 'EXPENSE', icon: 'GraduationCap', color: '#8B5CF6', created_at: now, updated_at: now },
                { id: uuidv4(), user_id: 'local', name: 'Compras', type: 'EXPENSE', icon: 'ShoppingBag', color: '#EC4899', created_at: now, updated_at: now },

                // Receitas
                { id: uuidv4(), user_id: 'local', name: 'Salário', type: 'INCOME', icon: 'Banknote', color: '#10B981', created_at: now, updated_at: now },
                { id: uuidv4(), user_id: 'local', name: 'Investimentos', type: 'INCOME', icon: 'TrendingUp', color: '#3B82F6', created_at: now, updated_at: now },
                { id: uuidv4(), user_id: 'local', name: 'Freelance', type: 'INCOME', icon: 'Laptop', color: '#F59E0B', created_at: now, updated_at: now },
            ];

            await this.categories.bulkAdd(defaultCategories);
        }

        // --- Transactions ---
        if (lsTransactions) {
            try {
                const data = JSON.parse(lsTransactions);
                await this.transactions.bulkAdd(data);
            } catch (e) { console.error('Migration error transactions', e) }
        }

        // --- Recurring ---
        if (lsRecurring) {
            try {
                const data = JSON.parse(lsRecurring);
                await this.recurringConfigs.bulkAdd(data);
            } catch (e) { console.error('Migration error recurring', e) }
        }

        // --- Settings ---
        if (lsSettings) {
            try {
                const data = JSON.parse(lsSettings);
                await this.settings.put({
                    budgetLimit: 0,
                    monthlyIncome: 0,
                    workHoursPerMonth: 160,
                    ...data,
                    id: 'global_settings'
                });
            } catch (e) { console.error('Migration error settings', e) }
        } else {
            await this.settings.put({
                id: 'global_settings',
                budgetLimit: 0,
                monthlyIncome: 0,
                workHoursPerMonth: 160
            });
        }

        console.log("Database seeded successfully.");
    }
}

export const db = new PocketManagerDB();