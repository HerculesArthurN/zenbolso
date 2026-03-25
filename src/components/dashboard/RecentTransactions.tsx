import React from 'react';
import { Ghost } from 'lucide-react';
import { Transaction } from '../../types';
import { transactionService } from '../../services/transactionService';
import { TransactionListItem } from '../transactions/TransactionListItem';
import { useCategoriesQuery, useAccountsQuery } from '../../hooks/useFinanceData';

interface RecentTransactionsProps {
    transactions: Transaction[];
    loading: boolean;
    onEdit: (t: Transaction) => void;
    onRefresh: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
    transactions,
    loading,
    onEdit,
    onRefresh
}) => {
    const { data: categories = [] } = useCategoriesQuery();
    const { data: accounts = [] } = useAccountsQuery();

    const handleDelete = async (id: string, description: string | null) => {
        if (window.confirm(`Deseja excluir "${description || 'lançamento'}"?`)) {
            try {
                await transactionService.deleteTransaction(id);
                onRefresh();
            } catch (error) {
                console.error('Delete error:', error);
                alert('Erro ao excluir transação.');
            }
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-[32px]" />
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                <Ghost size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Nenhuma transação</p>
                <p className="text-[10px] opacity-60">Sua jornada financeira começa aqui.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/50 dark:bg-slate-900/50 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden pb-2 mb-8">
            <div className="p-6 pb-4">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-[10px]">Lançamentos Recentes</h3>
            </div>
            <div className="px-2">
                {transactions.slice(0, 5).map((tx) => {
                    const category = categories.find(c => c.id === tx.category_id);
                    const account = accounts.find(a => a.id === tx.account_id);
                    return (
                        <TransactionListItem
                            key={tx.id}
                            transaction={tx}
                            categoryName={category?.name}
                            accountName={account?.name}
                            onEdit={onEdit}
                            onDelete={handleDelete}
                        />
                    );
                })}
            </div>
        </div>
    );
};
