import React, { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useCategories } from '../hooks/useCategories';
import { useRecurringTransactions } from '../hooks/useRecurringTransactions';
import { Plus, Loader2 } from 'lucide-react';
import { RecurringList } from '../components/recurring/RecurringList';
import { RecurringForm } from '../components/recurring/RecurringForm';

export const RecurringPage: React.FC = () => {
    const { accounts } = useDashboardData();
    const { categories } = useCategories();
    const { 
        transactions, 
        isLoading, 
        addTransaction, 
        cancelTransaction, 
        toggleTransaction 
    } = useRecurringTransactions();

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Recorrências</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Automatize suas contas fixas e salários.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                >
                    <Plus size={20} /> Nova Regra
                </button>
            </header>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-slate-400 text-sm animate-pulse">Carregando suas assinaturas...</p>
                </div>
            ) : (
                <RecurringList 
                    transactions={transactions} 
                    accounts={accounts} 
                    onToggle={toggleTransaction} 
                    onDelete={cancelTransaction} 
                    onOpenForm={() => setIsModalOpen(true)}
                />
            )}

            <RecurringForm 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                accounts={accounts} 
                categories={categories} 
                onSubmit={addTransaction} 
            />
        </div>
    );
};
