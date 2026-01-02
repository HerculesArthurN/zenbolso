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
