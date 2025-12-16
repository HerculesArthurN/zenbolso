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
            if (t.type === 'income') {
                acc.totalIncome += t.value;
                acc.balance += t.value;
            } else {
                acc.totalExpense += t.value;
                acc.balance -= t.value;
            }
            return acc;
        },
        { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
};