import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

interface BudgetWidgetProps {
    currentExpense: number;
    budgetLimit: number;
}

export const BudgetWidget: React.FC<BudgetWidgetProps> = ({ currentExpense, budgetLimit }) => {
    const { formatCurrency } = useLocaleFormat();

    if (budgetLimit <= 0) return null;

    // Sanitize values to prevent NaN
    const safeExpense = Number(currentExpense) || 0;
    const safeLimit = Number(budgetLimit) || 0;

    const percentage = Math.min((safeExpense / safeLimit) * 100, 100);
    const remaining = safeLimit - safeExpense;
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

    return (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden text-left">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        ORÇAMENTO MENSAL
                    </h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(safeExpense)}
                        </span>
                        <span className="text-sm text-gray-400 font-medium">
                            / {formatCurrency(safeLimit)}
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
                    ? <span className="text-rose-500">
                        Excedido em {formatCurrency(Math.abs(remaining))}
                    </span>
                    : <span>
                        Restam {formatCurrency(remaining)}
                    </span>
                }
            </p>
        </div>
    );
};