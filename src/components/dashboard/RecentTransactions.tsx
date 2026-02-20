import React from 'react';
import { Tag, ArrowUpRight, ArrowDownLeft, Ghost, Pencil, Trash2 } from 'lucide-react';
import { Transaction } from '../../types';
import { transactionService } from '../../services/transactionService';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';
import { safeNumber } from '../../utils/numberUtils';

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
    const { formatCurrency, formatDateShort } = useLocaleFormat();

    const handleDelete = async (id: string) => {
        if (window.confirm('Deseja excluir esta transação?')) {
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
                    <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                <Ghost size={40} className="mb-3 opacity-20" />
                <p className="text-sm">Nenhuma transação encontrada</p>
                <p className="text-xs opacity-60">Comece adicionando sua primeira transação.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Recentes</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="group p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${tx.type === 'INCOME'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                                }`}>
                                {tx.type === 'INCOME' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                    {tx.description || 'Sem descrição'}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Tag size={10} className="text-slate-400" />
                                    <span className="text-[10px] text-slate-500 uppercase tracking-tight font-medium">
                                        {formatDateShort(tx.date)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`text-sm font-bold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                                }`}>
                                {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(safeNumber(tx.amount, 0))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(tx)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(tx.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
