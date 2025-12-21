import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types';
import { ArrowUpRight, ArrowDownLeft, Trash2, Edit2, ClipboardList, ChevronDown, Clock } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { useCategoriesQuery, useSettingsQuery } from '../../hooks/useFinanceData';
import { CategoryIcon } from '../ui/CategoryIcon';

interface TransactionListProps {
    transactions: Transaction[];
    onDelete: (id: string) => void;
    onEdit: (transaction: Transaction) => void;
    loading?: boolean;
}

const ITEMS_PER_PAGE = 15;

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit, loading = false }) => {
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const { data: categories = [] } = useCategoriesQuery();
    const { data: settings } = useSettingsQuery();

    // Optimize category lookup map
    const categoryMap = useMemo(() => {
        const map = new Map<string, { icon?: string; color?: string }>();
        categories.forEach(c => {
            map.set(`${c.name}-${c.type}`, { icon: c.icon, color: c.color });
        });
        return map;
    }, [categories]);

    // Use reusable formatter
    const currencyFormatter = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), []);

    const hourlyRate = useMemo(() => {
        if (settings?.monthlyIncome && settings?.workHoursPerMonth) {
            return settings.monthlyIncome / settings.workHoursPerMonth;
        }
        return 0;
    }, [settings]);

    // Reset pagination when list changes
    React.useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [transactions]);

    const handleConfirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
        }
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    };

    // --- Grouping Logic ---
    const groupedTransactions = useMemo(() => {
        const visibleTransactions = transactions.slice(0, visibleCount);
        const groups: Record<string, Transaction[]> = {};

        visibleTransactions.forEach(t => {
            // Assume t.date is YYYY-MM-DD
            if (!groups[t.date]) {
                groups[t.date] = [];
            }
            groups[t.date].push(t);
        });

        return groups;
    }, [transactions, visibleCount]);

    const getGroupLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        // Fix Timezone issue for display
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset hours for accurate comparison
        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        const checkDate = new Date(adjustedDate);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate.getTime() === today.getTime()) return 'Hoje';
        if (checkDate.getTime() === yesterday.getTime()) return 'Ontem';

        return adjustedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', weekday: 'short' });
    };

    const getTimeCost = (value: number) => {
        if (hourlyRate <= 0) return null;
        const hours = value / hourlyRate;
        if (hours < 1) return null; // Don't show for small amounts to reduce noise
        return `-${Math.round(hours)}h trabalho`;
    };

    // --- Render Loading State ---
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-surface dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 w-full">
                            <Skeleton variant="rounded" className="w-10 h-10" />
                            <div className="space-y-2 flex-1">
                                <Skeleton variant="text" className="w-1/3" />
                                <Skeleton variant="text" className="w-1/4 h-3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // --- Render Empty State ---
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-surface dark:bg-surface-dark rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                    <ClipboardList className="text-slate-400 dark:text-slate-500" size={32} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma transação encontrada</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tente ajustar os filtros ou adicione uma nova.</p>
            </div>
        );
    }

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const hasMore = visibleCount < transactions.length;

    return (
        <>
            <div className="space-y-6">
                {sortedDates.map(date => (
                    <div key={date}>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 ml-2 sticky top-16 bg-background/95 dark:bg-background-dark/95 backdrop-blur-sm py-2 z-10 w-max pr-4 rounded-r-lg">
                            {getGroupLabel(date)}
                        </h3>
                        <div className="space-y-3">
                            {groupedTransactions[date].map((t) => {
                                const visual = categoryMap.get(`${t.category}-${t.type}`);
                                const icon = visual?.icon;
                                const color = visual?.color;

                                return (
                                    <div
                                        key={t.id}
                                        className="group flex items-center justify-between p-4 bg-surface dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div
                                                className={`w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0 transition-colors bg-opacity-10`}
                                                style={{ backgroundColor: color ? `${color}1A` : undefined }} // 10% opacity fallback
                                            >
                                                {icon ? (
                                                    <CategoryIcon iconName={icon} color={color} size={20} />
                                                ) : (
                                                    t.type === 'income'
                                                        ? <ArrowUpRight size={20} className="text-income" />
                                                        : <ArrowDownLeft size={20} className="text-expense" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-slate-900 dark:text-white truncate">{t.category}</p>
                                                    {t.tags && t.tags.length > 0 && (
                                                        <div className="hidden sm:flex items-center gap-1">
                                                            {t.tags.slice(0, 2).map(tag => (
                                                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                            {t.tags.length > 2 && (
                                                                <span className="text-[10px] text-slate-400">+{t.tags.length - 2}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                    {t.description && (
                                                        <span className="truncate max-w-[200px]">{t.description}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 flex-shrink-0 pl-2">
                                            <div className="text-right">
                                                <span className={`font-bold tabular-nums tracking-tight block ${t.type === 'income' ? 'text-income-text dark:text-income-dark' : 'text-slate-900 dark:text-white'
                                                    }`}>
                                                    {t.type === 'income' ? '+' : '-'}
                                                    {currencyFormatter.format(t.value)}
                                                </span>
                                                {t.type === 'expense' && hourlyRate > 0 && getTimeCost(t.value) && (
                                                    <span className="text-[10px] font-medium text-rose-500/80 flex justify-end items-center gap-1">
                                                        <Clock size={10} /> {getTimeCost(t.value)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEdit(t)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    aria-label="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(t.id)}
                                                    className="p-2 text-slate-400 hover:text-expense hover:bg-expense/10 rounded-lg transition-all"
                                                    aria-label="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {hasMore && (
                    <div className="pt-4">
                        <Button
                            variant="secondary"
                            className="w-full gap-2 text-xs"
                            onClick={handleLoadMore}
                        >
                            <ChevronDown size={14} />
                            Carregar mais ({transactions.length - visibleCount} restantes)
                        </Button>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                message="Tem certeza que deseja excluir esta transação?"
                confirmText="Confirmar"
            />
        </>
    );
};