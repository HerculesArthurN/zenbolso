import { transactionService } from './transactionService';

// Facade for transactionService to maintain compatibility
export const getTransactions = async () => transactionService.fetchTransactions();
export const postTransaction = async (t: any) => {
    if (t.id) {
        // If has ID, it might be an update or insert-with-id
        // transactionService.createTransaction handles upsert-like behavior via put
        return transactionService.createTransaction(t);
    } else {
        return transactionService.createTransaction(t);
    }
};
export const updateTransaction = async (t: any) => transactionService.updateTransaction(t.id, t);

export const handleApiError = (error: any) => {
    console.error('API Error:', error);
    throw error;
};

export * from './repositories/accounts';
export * from './repositories/categories';
export * from './repositories/recurrence';
export * from './repositories/goals';
export * from './repositories/settings';
export * from './dashboard.service';