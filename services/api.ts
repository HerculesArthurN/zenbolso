import { TransactionRepository } from './repositories/transaction.repository';





// Facade for TransactionRepository to maintain compatibility
export const getTransactions = async () => TransactionRepository.findAll();
export const postTransaction = async (t: any) => {
    if ('id' in t) {
        return TransactionRepository.add(t);
    } else {
        return TransactionRepository.create(t);
    }
};
export const updateTransaction = async (t: any) => TransactionRepository.update(t);

export * from './repositories/accounts';
export * from './repositories/categories';
export * from './repositories/recurrence';
export * from './repositories/goals';
export * from './repositories/settings';
export * from './dashboard.service';