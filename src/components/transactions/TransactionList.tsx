import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types';
import { ClipboardList, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { useCategoriesQuery, useAccountsQuery } from '../../hooks/useFinanceData';
import { TransactionListItem } from './TransactionListItem';

interface TransactionListProps {
    transactions: Transaction[];
    onDelete: (id: string, description: string | null) => void;
    onEdit: (transaction: Transaction) => void;
    loading?: boolean;
}

const ITEMS_PER_PAGE = 30;

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit, loading = false }) => {
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const { data: categories = [] } = useCategoriesQuery();
    const { data: accounts = [] } = useAccountsQuery();

    React.useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [transactions]);

    const handleLoadMore = () => setVisibleCount(p => p + ITEMS_PER_PAGE);

    const groupedTransactions = useMemo(() => {
        const visibleTransactions = transactions.slice(0, visibleCount);
        const groups: Record<string, Transaction[]> = {};

        visibleTransactions.forEach(t => {
            if (!groups[t.date]) groups[t.date] = [];
            groups[t.date].push(t);
        });

        return groups;
    }, [transactions, visibleCount]);

    const getGroupLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        const checkDate = new Date(adjustedDate);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate.getTime() === today.getTime()) return 'Hoje';
        if (checkDate.getTime() === yesterday.getTime()) return 'Ontem';

        return adjustedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', weekday: 'short' });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 w-full">
                            <Skeleton variant="rounded" className="w-12 h-12 rounded-[20px]" />
                            <div className="space-y-2 flex-1">
                                <Skeleton variant="text" className="w-1/3 h-4" />
                                <Skeleton variant="text" className="w-1/4 h-3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-[24px] mb-3">
                    <ClipboardList className="text-slate-400 dark:text-slate-500" size={32} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhuma transação</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center max-w-[250px]">Tente ajustar os filtros ou adicione uma nova.</p>
            </div>
        );
    }

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const hasMore = visibleCount < transactions.length;

    return (
        <div className="space-y-6">
            {sortedDates.map(date => (
                <div key={date}>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2 sticky top-[72px] bg-slate-50/95 dark:bg-slate-950/95 py-2 z-20 w-max pr-4 backdrop-blur-md rounded-r-lg shadow-sm">
                        {getGroupLabel(date)}
                    </h3>
                    <div className="space-y-1">
                        {groupedTransactions[date].map((t) => {
                            const category = categories.find(c => c.id === t.category_id);
                            const account = accounts.find(a => a.id === t.account_id);

                            return (
                                <TransactionListItem 
                                    key={t.id}
                                    transaction={t}
                                    categoryName={category?.name}
                                    accountName={account?.name}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}

            {hasMore && (
                <div className="pt-4 pb-8">
                    <Button
                        variant="secondary"
                        className="w-full justify-center gap-2 text-[11px] font-bold py-5 rounded-[20px] uppercase tracking-widest bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
                        onClick={handleLoadMore}
                    >
                        <ChevronDown size={16} />
                        Carregar mais ({transactions.length - visibleCount} restantes)
                    </Button>
                </div>
            )}
        </div>
    );
};