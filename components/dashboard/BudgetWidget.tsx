import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface BudgetWidgetProps {
    currentExpense: number;
    budgetLimit: number;
}

export const BudgetWidget: React.FC<BudgetWidgetProps> = ({ currentExpense, budgetLimit }) => {
    if (budgetLimit <= 0) return null;

    const percentage = Math.min((currentExpense / budgetLimit) * 100, 100);
    const remaining = budgetLimit - currentExpense;
    const isExceeded = remaining < 0;

    let colorClass = 'bg-emerald-500';
    let textColorClass = 'text-emerald-600 dark:text-emerald-400';
    let bgClass = 'bg-emerald-50 dark:bg-emerald-900/30';

    if (percentage >= 100) {
        colorClass = 'bg-rose-500';
        textColorClass = 'text-rose-600 dark:text-rose-400';
        bgClass = 'bg-rose-50 dark:bg-rose-900/30';
    } else if (percentage > 75) {
        colorClass = 'bg-amber-500';
        textColorClass = 'text-amber-600 dark:text-amber-400';
        bgClass = 'bg-amber-50 dark:bg-amber-900/30';
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(val));

    return (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Orçamento Mensal</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(currentExpense)}
                        </span>
                        <span className="text-sm text-gray-400 font-medium">
                            / {formatCurrency(budgetLimit)}
                        </span>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${bgClass} ${textColorClass}`}>
                    {isExceeded ? <AlertCircle size={12} /> : <TrendingUp size={12} />}
                    {Math.round(percentage)}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Status Message */}
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {isExceeded
                    ? <span className="text-rose-500">Você excedeu o orçamento em {formatCurrency(remaining)}.</span>
                    : <span>Resta <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(remaining)}</span> para gastar este mês.</span>
                }
            </p>
        </div>
    );
};