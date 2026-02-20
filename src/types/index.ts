export type AccountType = 'WALLET' | 'BANK' | 'INVESTMENT';
export type CategoryType = 'INCOME' | 'EXPENSE';
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Account {
    id: string;
    user_id: string;
    name: string;
    balance: number;
    type: AccountType;
    color: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    type: CategoryType;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    account_id: string;
    category_id: string | null;
    amount: number;
    description: string | null;
    date: string;
    type: TransactionType;
    is_paid: boolean;
    created_at: string;
    updated_at: string;
}

export interface RecurringTransaction {
    id: string;
    user_id: string;
    account_id: string;
    category_id: string | null;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    day_of_month: number;
    last_processed_date: string | null; // Format: YYYY-MM
    active: boolean;
    created_at: string;
    updated_at: string;
}

export type SyncStatus = 'pending' | 'success' | 'error' | 'retry';

export interface SyncJob {
    id?: number;
    type: 'create' | 'update' | 'delete';
    entity: 'transactions' | 'accounts' | 'categories' | 'recurring_transactions';
    entity_id: string;
    payload: any;
    status: SyncStatus;
    retry_count: number;
    error?: string;
    created_at: number;
}

export interface RecurringConfig {
    id: string;
    type: TransactionType;
    value: number;
    category: string;
    account_id: string;
    user_id: string;
    description: string;
    frequency: 'monthly' | 'weekly' | 'daily' | 'yearly';
    rruleString: string;
    lastGeneratedDate: string;
    nextDueDate: string; // or null
    active: boolean;
}

export interface AppSettings {
    budgetLimit: number;
    monthlyIncome: number;
    workHoursPerMonth: number;
    isDark?: boolean;
    googleDrive?: {
        enabled: boolean;
        lastBackup?: string;
        clientId?: string;
        frequency?: 'daily' | 'weekly' | 'monthly';
    };
}

export interface CategorySummary {
    category: string;
    total: number;
    percentage: number;
    color: string;
    icon: string;
}

export interface AccountSummary extends Account {
    currentBalance: number;
}

export interface MonthlySummary {
    month: string;
    fullDate: string;
    income: number;
    expense: number;
    balance: number;
}

export interface DashboardSummary {
    netBalance: number;
    totalIncome: number;
    totalExpense: number;
    currentMonthExpense: number;
    budgetLimit: number;
    categories: CategorySummary[];
    accounts: AccountSummary[];
    insights: Insight[];
}

export interface Insight {
    id: string;
    type: 'alert' | 'success' | 'info' | 'neutral' | 'warning';
    title: string;
    message: string;
    icon: string;
}

export interface Badge {
    id: string;
    key: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    imageUrl?: string;
    deadline?: string;
    icon?: string;
    color?: string;
    created_at: string;
    updated_at: string;
}
