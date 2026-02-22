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
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { useData } from '../contexts/DataContext';
import { ZenInsightsCard } from '../components/dashboard/ZenInsightsCard';

export const Dashboard: React.FC = () => {
    const { formatCurrency } = useLocaleFormat();
    const { accounts, transactions, loading, refresh } = useDashboardData();
    const { addToast } = useToast();
    const { openTransactionModal } = useData() as any;

    const [showOnboarding, setShowOnboarding] = React.useState(false);

    React.useEffect(() => {
        if (!loading && accounts.length === 0) {
            setShowOnboarding(true);
        } else {
            setShowOnboarding(false);
        }
    }, [loading, accounts.length]);

    const handleFinishOnboarding = () => {
        setShowOnboarding(false);
        refresh();
    };

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
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Visão Geral
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                        Seu fluxo financeiro em tempo real
                    </p>
                </div>

                <div className="flex items-center justify-between w-full bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">
                            Saldo Atual
                        </span>
                        <span className={`text-2xl font-black leading-none ${accounts.reduce((acc, a) => acc + safeNumber(a.balance, 0), 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatCurrency(accounts.reduce((acc, a) => acc + safeNumber(a.balance, 0), 0))}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refresh()}
                            className="p-3 text-slate-400 hover:text-indigo-600 transition-all rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800"
                            aria-label="Atualizar"
                        >
                            <RefreshCw size={22} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
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

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-xs uppercase tracking-widest">Minhas Contas</h4>
                        <div className="space-y-5">
                            {accounts.slice(0, 3).map(acc => (
                                <div key={acc.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: acc.color }} />
                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{acc.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(safeNumber(acc.balance, 0))}
                                    </span>
                                </div>
                            ))}
                            {accounts.length === 0 && !loading && (
                                <p className="text-xs text-slate-400 text-center py-2 italic font-medium">Nenhuma conta encontrada</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showOnboarding && (
                <OnboardingWizard isOpen={showOnboarding} onComplete={handleFinishOnboarding} />
            )}
        </div>
    );
};
