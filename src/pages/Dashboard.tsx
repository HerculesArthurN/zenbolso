import React from 'react';
import { RefreshCw, Plus } from 'lucide-react'; // Added based on usage in JSX
import { useDashboardData } from '../hooks/useDashboardData';
import { SummaryOverview } from '../components/dashboard/SummaryOverview';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { Transaction } from '../types';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '../hooks/useLocaleFormat';
import { safeNumber } from '../utils/numberUtils';

import { recurringService } from '../services/recurringService';
import { useToast } from '../contexts/ToastContext';

import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { useData } from '../contexts/DataContext';
import { ZenInsightsCard } from '../components/dashboard/ZenInsightsCard';
import { SyncStatus } from '../components/common/SyncStatus';

export const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const { formatCurrency } = useLocaleFormat();
    const { accounts, transactions, loading, refresh } = useDashboardData();
    const { addToast } = useToast();
    const {
        openTransactionModal
    } = useData() as any;

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
                    addToast(t('dashboard.recurring_processed', { count }), 'success', 5000);
                    refresh();
                }
            } catch (err) {
                console.error('Error processing recurring transactions:', err);
            }
        };

        processRecurring();
    }, [addToast, refresh, t]);

    const handleOpenCreate = () => {
        openTransactionModal();
    };

    const handleOpenEdit = (t: Transaction) => {
        openTransactionModal(t);
    };


    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {t('dashboard.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {t('dashboard.subtitle')}
                    </p>
                </div>

                <div className="md:hidden flex items-center justify-between w-full bg-white dark:bg-slate-900 p-4 pl-16 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                            {t('sidebar.current_balance')}
                        </span>
                        <span className={`text-xl font-black leading-none ${accounts.reduce((acc, a) => acc + safeNumber(a.balance, 0), 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatCurrency(accounts.reduce((acc, a) => acc + safeNumber(a.balance, 0), 0))}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <SyncStatus />
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <SyncStatus />
                    <button
                        onClick={() => refresh()}
                        className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all active:rotate-180"
                        title={t('dashboard.refresh')}
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={handleOpenCreate}
                        id="btn-new-transaction"
                        className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary dark:bg-primary-dark text-primary-fg dark:text-primary-fg-dark rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        {t('transactions.new')}
                    </button>
                </div>
            </header>

            {/* Summary Grid */}
            <SummaryOverview
                accounts={accounts}
                transactions={transactions}
                loading={loading}
            />

            {/* Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                <div className="lg:col-span-2 space-y-6">
                    <RecentTransactions
                        transactions={transactions}
                        loading={loading}
                        onEdit={handleOpenEdit}
                        onRefresh={refresh}
                    />
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <ZenInsightsCard
                        transactions={transactions}
                        loading={loading}
                    />

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">{t('dashboard.my_accounts')}</h4>
                        <div className="space-y-4">
                            {accounts.slice(0, 3).map(acc => (
                                <div key={acc.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{acc.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(safeNumber(acc.balance, 0))}
                                    </span>
                                </div>
                            ))}
                            {accounts.length === 0 && !loading && (
                                <p className="text-xs text-slate-400 text-center py-2">{t('dashboard.no_accounts')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {
                showOnboarding && (
                    <OnboardingWizard onFinish={handleFinishOnboarding} />
                )
            }
        </div >
    );
};
