import React, { useState } from 'react';
import { useAnnualSummaryQuery, useForecastQuery, useSummaryQuery, useTransactionsQuery } from '../hooks/useFinanceData';
import { AnnualChart } from '../components/dashboard/AnnualChart';
import { ExpensesTreemap } from '../components/dashboard/ExpensesTreemap';
import { ForecastWidget } from '../components/dashboard/ForecastWidget';
import { BudgetWidget } from '../components/dashboard/BudgetWidget';
import { GoalsWidget } from '../components/dashboard/GoalsWidget';
import { PurchaseSimulator } from '../components/tools/PurchaseSimulator';
import { ShoppingBag } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { COLORS } from '../constants';

export const Planning: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const { data: summary } = useSummaryQuery();
  const { data: forecastData = [] } = useForecastQuery();
  const { data: annualData = [] } = useAnnualSummaryQuery(selectedYear);
  const { data: transactions = [], isLoading } = useTransactionsQuery();

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const dynamicCategories = React.useMemo(() => {
    const totals: Record<string, number> = {};
    let totalExp = 0;
    transactions.forEach(t => {
        if (t.type === 'expense') {
            const cat = t.category || 'Outros';
            totals[cat] = (totals[cat] || 0) + t.value;
            totalExp += t.value;
        }
    });
    return Object.entries(totals)
        .map(([category, total], index) => ({
            category,
            total,
            percentage: totalExp > 0 ? (total / totalExp) * 100 : 0,
            color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.total - a.total);
  }, [transactions]);

  if (isLoading || !summary) {
      return <Skeleton variant="rounded" className="h-96 w-full rounded-3xl" />;
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Planejamento</h1>
            <p className="text-slate-500 text-sm">Metas, orçamento e futuro.</p>
        </div>
        <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-medium hover:bg-purple-200 transition-colors"
        >
            <ShoppingBag size={18} /> Simular Compra
        </button>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
              {summary.budgetLimit > 0 && (
                <BudgetWidget 
                    currentExpense={summary.currentMonthExpense} 
                    budgetLimit={summary.budgetLimit} 
                />
              )}
              {forecastData.length > 0 && <ForecastWidget data={forecastData} />}
              <GoalsWidget />
          </div>

          <div className="space-y-6">
              <AnnualChart 
                data={annualData} 
                year={selectedYear} 
                onYearChange={setSelectedYear} 
              />
              <ExpensesTreemap data={dynamicCategories} />
          </div>
      </section>

      <PurchaseSimulator 
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          summary={summary}
          forecast={forecastData}
      />
    </div>
  );
};