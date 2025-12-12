import React, { useMemo } from 'react';
import { Transaction } from '../../types';
import { TrendingDown, TrendingUp, Calendar, History } from 'lucide-react';

interface BenchmarkWidgetProps {
  transactions: Transaction[];
}

export const BenchmarkWidget: React.FC<BenchmarkWidgetProps> = ({ transactions }) => {
  const data = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayDay = now.getDate();

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthIdx = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonthName = lastMonthDate.toLocaleDateString('pt-BR', { month: 'long' });

    let currentMonthTotal = 0;
    let lastMonthTotal = 0;

    transactions.forEach(t => {
      if (t.type !== 'expense') return;

      const d = new Date(t.date);
      // Adjust timezone
      const localD = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      const day = localD.getDate();

      // Only count up to TODAY's day for both months
      if (day <= todayDay) {
          if (localD.getMonth() === currentMonth && localD.getFullYear() === currentYear) {
              currentMonthTotal += t.value;
          } else if (localD.getMonth() === lastMonthIdx && localD.getFullYear() === lastMonthYear) {
              lastMonthTotal += t.value;
          }
      }
    });

    return {
        currentMonthTotal,
        lastMonthTotal,
        lastMonthName,
        day: todayDay
    };
  }, [transactions]);

  if (data.lastMonthTotal === 0 && data.currentMonthTotal === 0) return null;

  const diff = data.currentMonthTotal - data.lastMonthTotal;
  const diffPercent = data.lastMonthTotal > 0 ? (diff / data.lastMonthTotal) * 100 : 0;
  const isBetter = diff <= 0;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  // Calculate widths for bars (normalize to the larger of the two)
  const maxVal = Math.max(data.currentMonthTotal, data.lastMonthTotal, 1);
  const currentWidth = (data.currentMonthTotal / maxVal) * 100;
  const lastWidth = (data.lastMonthTotal / maxVal) * 100;

  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <History size={16} className="text-purple-500" /> Eu do Passado
            </h3>
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isBetter ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'}`}>
                {isBetter ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                {isBetter ? 'Economia de' : 'Aumento de'} {Math.abs(diffPercent).toFixed(0)}%
            </div>
        </div>

        <div className="space-y-4">
            {/* Current Month Bar */}
            <div className="relative">
                <div className="flex justify-between text-xs font-medium mb-1 text-gray-900 dark:text-white">
                    <span className="flex items-center gap-1"><Calendar size={12} className="text-emerald-500" /> Este Mês (Dia {data.day})</span>
                    <span>{formatCurrency(data.currentMonthTotal)}</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isBetter ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${currentWidth}%` }}
                    />
                </div>
            </div>

            {/* Last Month Bar */}
            <div className="relative opacity-60">
                <div className="flex justify-between text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1 capitalize"><Calendar size={12} /> {data.lastMonthName} (Dia {data.day})</span>
                    <span>{formatCurrency(data.lastMonthTotal)}</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gray-400 dark:bg-gray-600 rounded-full transition-all duration-1000"
                        style={{ width: `${lastWidth}%` }}
                    />
                </div>
            </div>
        </div>

        <p className="text-xs text-center text-gray-400 mt-1">
            {isBetter 
                ? `Você gastou ${formatCurrency(Math.abs(diff))} a menos que no mês passado.`
                : `Você gastou ${formatCurrency(diff)} a mais que no mês passado.`
            }
        </p>
    </div>
  );
};