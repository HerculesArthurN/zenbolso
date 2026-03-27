import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { SummaryOverview } from '../components/dashboard/SummaryOverview';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { Transaction } from '../types';
import { useLocaleFormat } from '../hooks/useLocaleFormat';
import { safeNumber } from '../utils/numberUtils';
import { recurringService } from '../services/recurringService';
import { useToast } from '../contexts/ToastContext';

import { useData } from '../contexts/DataContext';
import { ZenInsightsCard } from '../components/dashboard/ZenInsightsCard';

export const Dashboard: React.FC = () => {
    const { formatCurrency } = useLocaleFormat();
    const { accounts, transactions, loading, refresh } = useDashboardData();
    const { addToast } = useToast();
    const { openTransactionModal } = useData() as any;



    React.useEffect(() => {
        const processRecurring = async () => {
            try {
                const count = await recurringService.processDueTransactions();
                if (count > 0) {
                    addToast(`${count} transações recorrentes processadas`, 'success', 5000);
                    refresh();
                }
            } catch (err) {
                console.error('Error processing recurring transactions:', err);
            }
        };

        processRecurring();
    }, [addToast, refresh]);

    const handleOpenEdit = (t: Transaction) => {
        openTransactionModal(t);
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col gap-4 px-2">
                <div className="text-center pt-2">
                    <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
                        Visão Geral
                    </h1>
                    <p className="text-zinc-400 mt-1 text-xs uppercase tracking-widest font-semibold">
                        Seu fluxo financeiro
                    </p>
                </div>

                <div className="relative flex flex-col items-center justify-center w-full bg-zinc-800/80 p-8 rounded-[32px] border border-zinc-700/50 shadow-xl transition-colors mt-2">
                    <button
                        onClick={() => refresh()}
                        className="absolute top-4 right-4 p-3 text-zinc-500 hover:text-zinc-300 transition-all rounded-full hover:bg-zinc-700/50 active:bg-zinc-700"
                        aria-label="Atualizar"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                        Saldo Atual
                    </span>
                    <span className={`text-4xl sm:text-5xl font-black tracking-tighter ${accounts.reduce((acc, a) => acc + safeNumber(a.balance, 0), 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {formatCurrency(accounts.reduce((acc, a) => acc + safeNumber(a.balance, 0), 0))}
                    </span>
                </div>
            </header>

            {/* Summary Grid */}
            <div className="px-2">
                <SummaryOverview
                    accounts={accounts}
                    transactions={transactions}
                    loading={loading}
                />
            </div>

            {/* Content Body - Strictly Single Column */}
            <div className="flex flex-col gap-8 text-left px-2">
                <div className="space-y-6">
                    <RecentTransactions
                        transactions={transactions}
                        loading={loading}
                        onEdit={handleOpenEdit}
                        onRefresh={refresh}
                    />
                </div>

                {/* Sidebar Column (Now Stacked) */}
                <div className="space-y-6 pb-20">
                    <ZenInsightsCard
                        transactions={transactions}
                        loading={loading}
                    />

                    <div className="p-6 bg-zinc-800/80 rounded-[32px] border border-zinc-700/50 shadow-md transition-colors">
                        <h4 className="font-bold text-zinc-100 mb-6 text-xs uppercase tracking-widest">Minhas Contas</h4>
                        <div className="space-y-5">
                            {accounts.slice(0, 3).map(acc => (
                                <div key={acc.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: acc.color }} />
                                        <span className="text-sm font-semibold text-zinc-300">{acc.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-zinc-100">
                                        {formatCurrency(safeNumber(acc.balance, 0))}
                                    </span>
                                </div>
                            ))}
                            {accounts.length === 0 && !loading && (
                                <p className="text-xs text-zinc-500 text-center py-2 italic font-medium">Nenhuma conta encontrada</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};
