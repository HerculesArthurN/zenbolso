import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { SummaryOverview } from '../components/dashboard/SummaryOverview';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { NewTransactionModal } from '../components/transactions/NewTransactionModal';
import { RefreshCw, Plus, Settings } from 'lucide-react';
import { Transaction } from '../types';
import { Link } from 'react-router-dom';

import { recurringService } from '../services/recurringService';
import { useToast } from '../../context/ToastContext';

import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { useData } from '../../context/DataContext';
import { ZenInsightsCard } from '../components/dashboard/ZenInsightsCard';

export const Dashboard: React.FC = () => {
    const { accounts, transactions, loading, refresh } = useDashboardData();
    const { addToast } = useToast();
    const {
        isTransactionModalOpen: isModalOpen,
        openTransactionModal,
        closeTransactionModal,
        transactionToEdit: editingTransaction
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
                    addToast(`${count} transações recorrentes lançadas automaticamente.`, 'success', 5000);
                    refresh();
                }
            } catch (err) {
                console.error('Error processing recurring transactions:', err);
            }
        };

        processRecurring();
    }, [addToast, refresh]);

    const handleOpenCreate = () => {
        openTransactionModal();
    };

    const handleOpenEdit = (t: Transaction) => {
        openTransactionModal(t);
    };

    const handleCloseModal = () => {
        closeTransactionModal();
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Minha Carteira
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Sua saúde financeira em um só lugar.
                    </p>
                </div>

                <Link
                    to="/settings"
                    className="md:hidden p-3 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all active:scale-95"
                    aria-label="Acessar Configurações"
                >
                    <Settings size={20} />
                </Link>

                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={() => refresh()}
                        className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all active:rotate-180"
                        title="Atualizar dados"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={handleOpenCreate}
                        className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary dark:bg-primary-dark text-primary-fg dark:text-primary-fg-dark rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        Nova Transação
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
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Minhas Contas</h4>
                        <div className="space-y-4">
                            {accounts.slice(0, 3).map(acc => (
                                <div key={acc.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{acc.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}
                                    </span>
                                </div>
                            ))}
                            {accounts.length === 0 && !loading && (
                                <p className="text-xs text-slate-400 text-center py-2">Nenhuma conta cadastrada.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <NewTransactionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                accounts={accounts}
                isLoadingAccounts={loading}
                initialData={editingTransaction}
                onSuccess={refresh}
            />

            {showOnboarding && (
                <OnboardingWizard onFinish={handleFinishOnboarding} />
            )}
        </div>
    );
};
