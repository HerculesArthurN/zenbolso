import { Transaction } from '../../types';

export interface BalanceResult {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

/**
 * Calcula o balanço financeiro a partir de uma lista de transações.
 * Função pura: Input -> Output, sem efeitos colaterais.
 */
export const calculateBalance = (transactions: Transaction[]): BalanceResult => {
    return transactions.reduce(
        (acc, t) => {
            if (t.type === 'INCOME') {
                acc.totalIncome += t.amount;
                acc.balance += t.amount;
            } else if (t.type === 'EXPENSE') {
                acc.totalExpense += t.amount;
                acc.balance -= t.amount;
            }
            return acc;
        },
        { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
};