import React from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Account, Transaction } from '../../types';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';
import { safeNumber } from '../../utils/numberUtils';

interface SummaryOverviewProps {
    accounts: Account[];
    transactions: Transaction[];
    loading: boolean;
}

export const SummaryOverview: React.FC<SummaryOverviewProps> = ({ accounts, transactions, loading }) => {
    const { formatCurrency } = useLocaleFormat();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const totalBalance = accounts.reduce((acc, account) => acc + safeNumber(account.balance, 0), 0);

    const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear;
    });

    const monthIncome = monthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((acc, t) => acc + safeNumber(t.amount, 0), 0);

    const monthExpense = monthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + safeNumber(t.amount, 0), 0);

    const Skeleton = () => (
        <div className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl border border-slate-200 dark:border-slate-700" />
    );

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton />
                <Skeleton />
                <Skeleton />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Wallet size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-500">Saldo Total</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalBalance)}
                </h3>
            </div>

            {/* Income Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <ArrowUpCircle size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-500">Receitas do Mês</span>
                </div>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(monthIncome)}
                </h3>
            </div>

            {/* Expense Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
                        <ArrowDownCircle size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-500">Despesas do Mês</span>
                </div>
                <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(monthExpense)}
                </h3>
            </div>
        </div>
    );
};
