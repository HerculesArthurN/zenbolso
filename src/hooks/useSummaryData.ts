import { useMemo } from 'react';
import { isThisMonth, parseISO } from 'date-fns';
import { Account, Transaction } from '../types';
import { safeNumber } from '../utils/numberUtils';

interface UseSummaryDataProps {
    accounts: Account[];
    transactions: Transaction[];
}

export const useSummaryData = ({ accounts, transactions }: UseSummaryDataProps) => {
    return useMemo(() => {
        const totalBalance = accounts.reduce(
            (acc, account) => acc + safeNumber(account.balance, 0),
            0
        );

        const monthTransactions = transactions.filter((t) => {
            if (!t.date) return false;
            try {
                const date = parseISO(t.date);
                return isThisMonth(date);
            } catch {
                return false;
            }
        });

        const monthIncome = monthTransactions
            .filter((t) => t.type === 'INCOME')
            .reduce((acc, t) => acc + safeNumber(t.amount, 0), 0);

        const monthExpense = monthTransactions
            .filter((t) => t.type === 'EXPENSE')
            .reduce((acc, t) => acc + safeNumber(t.amount, 0), 0);

        return {
            totalBalance: safeNumber(totalBalance, 0),
            monthIncome: safeNumber(monthIncome, 0),
            monthExpense: safeNumber(monthExpense, 0),
        };
    }, [accounts, transactions]);
};
