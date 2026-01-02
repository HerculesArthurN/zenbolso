import React from 'react';
import { Tag, ArrowUpRight, ArrowDownLeft, Ghost, Pencil, Trash2 } from 'lucide-react';
import { Transaction } from '../../types';
import { transactionService } from '../../services/transactionService';

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
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
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
                <p className="text-sm">Nenhuma movimentação recente</p>
                <p className="text-xs opacity-60">Comece adicionando uma transação.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Transações Recentes</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {transactions.slice(0, 10).map((t) => (
                    <div key={t.id} className="group p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${t.type === 'INCOME'
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                                }`}>
                                {t.type === 'INCOME' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                    {t.description || 'Sem descrição'}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Tag size={10} className="text-slate-400" />
                                    <span className="text-[10px] text-slate-500 uppercase tracking-tight font-medium">
                                        {formatDate(t.date)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                                }`}>
                                {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(t)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(t.id)}
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
