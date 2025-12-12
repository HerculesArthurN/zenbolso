import Dexie, { Table } from 'dexie';
import { Transaction, Account, Category, RecurringConfig, AppSettings, Goal } from '../types';
import { STORAGE_KEY, CATEGORIES as DEFAULT_CATS_OBJ, CATEGORY_ICONS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// Legacy keys for migration
const RECURRING_STORAGE_KEY = 'pocket_manager_recurring_v1';
const ACCOUNTS_STORAGE_KEY = 'pocket_manager_accounts_v1';
const SETTINGS_STORAGE_KEY = 'pocket_manager_settings_v1';
const CATEGORIES_STORAGE_KEY = 'pocket_manager_categories_v1';

class PocketManagerDB extends Dexie {
  transactions!: Table<Transaction, string>;
  accounts!: Table<Account, string>;
  categories!: Table<Category, string>;
  recurringConfigs!: Table<RecurringConfig, string>;
  settings!: Table<AppSettings & { id: string }, string>;
  goals!: Table<Goal, string>;

  constructor() {
    super('PocketManagerDB');
    
    // Define Schema
    (this as any).version(2).stores({
      transactions: 'id, date, type, category, accountId',
      accounts: 'id',
      categories: 'id, type, name',
      recurringConfigs: 'id, active',
      settings: 'id',
      goals: 'id'
    });

    // Populate / Migrate Hook
    (this as any).on('populate', async () => {
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
          } catch(e) { console.error('Migration error accounts', e)}
      } else {
          // Default Account if nothing exists
          await this.accounts.add({
            id: 'default-wallet',
            name: 'Carteira',
            type: 'cash',
            initialBalance: 0,
            color: '#10b981'
          });
      }

      // --- Categories (SEEDING vs MIGRATION) ---
      if (lsCategories) {
          // Migração legado
          try {
              const data = JSON.parse(lsCategories);
              await this.categories.bulkAdd(data);
          } catch(e) { console.error('Migration error categories', e)}
      } else {
          // SEEDING: Categorias Padrão "Rich Data"
          const defaultCategories: Category[] = [
              // Despesas
              { id: uuidv4(), name: 'Moradia', type: 'expense', icon: 'Home', color: '#00897B' },
              { id: uuidv4(), name: 'Alimentação', type: 'expense', icon: 'Utensils', color: '#D97706' },
              { id: uuidv4(), name: 'Transporte', type: 'expense', icon: 'Car', color: '#F43F5E' },
              { id: uuidv4(), name: 'Lazer', type: 'expense', icon: 'Gamepad2', color: '#6366F1' },
              { id: uuidv4(), name: 'Saúde', type: 'expense', icon: 'HeartPulse', color: '#EF4444' },
              { id: uuidv4(), name: 'Educação', type: 'expense', icon: 'GraduationCap', color: '#8B5CF6' },
              { id: uuidv4(), name: 'Compras', type: 'expense', icon: 'ShoppingBag', color: '#EC4899' },
              
              // Receitas
              { id: uuidv4(), name: 'Salário', type: 'income', icon: 'Banknote', color: '#10B981' },
              { id: uuidv4(), name: 'Investimentos', type: 'income', icon: 'TrendingUp', color: '#3B82F6' },
              { id: uuidv4(), name: 'Freelance', type: 'income', icon: 'Laptop', color: '#F59E0B' },
          ];
          
          await this.categories.bulkAdd(defaultCategories);
      }

      // --- Transactions ---
      if (lsTransactions) {
          try {
              const data = JSON.parse(lsTransactions);
              await this.transactions.bulkAdd(data);
          } catch(e) { console.error('Migration error transactions', e)}
      }

      // --- Recurring ---
      if (lsRecurring) {
          try {
              const data = JSON.parse(lsRecurring);
              await this.recurringConfigs.bulkAdd(data);
          } catch(e) { console.error('Migration error recurring', e)}
      }

      // --- Settings ---
      if (lsSettings) {
          try {
              const data = JSON.parse(lsSettings);
              await this.settings.put({ ...data, id: 'global_settings' });
          } catch(e) { console.error('Migration error settings', e)}
      } else {
          await this.settings.put({ id: 'global_settings', budgetLimit: 0 });
      }

      console.log("Database seeded successfully.");
  }
}

export const db = new PocketManagerDB();