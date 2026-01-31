import React, { useState } from 'react';
import { useAnnualSummaryQuery, useForecastQuery, useSummaryQuery, useTransactionsQuery } from '../hooks/useFinanceData';
import { AnnualChart } from '../components/dashboard/AnnualChart';
import { ExpensesTreemap } from '../components/dashboard/ExpensesTreemap';
import { ForecastWidget } from '../components/dashboard/ForecastWidget';
import { BudgetWidget } from '../components/dashboard/BudgetWidget';
import { GoalsWidget } from '../components/dashboard/GoalsWidget';
import { PurchaseSimulator } from '../components/tools/PurchaseSimulator';
import { ShoppingBag, Settings } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import { SyncStatus } from '../src/components/common/SyncStatus';
import { Link } from 'react-router-dom';
import { useLocaleFormat } from '../src/hooks/useLocaleFormat';

export const Planning: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useLocaleFormat();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: summary, isLoading: isSummaryLoading } = useSummaryQuery();
  const { data: forecastData = [] } = useForecastQuery();
  const { data: annualData = [] } = useAnnualSummaryQuery(selectedYear);
  const { data: transactions = [], isLoading: isTransactionsLoading } = useTransactionsQuery();

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const isLoading = isSummaryLoading || isTransactionsLoading;

  if (isLoading || !summary) {
    return (
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-2 text-left">
            <Skeleton variant="text" className="h-8 w-48" />
            <Skeleton variant="text" className="h-4 w-32" />
          </div>
          <Skeleton variant="rounded" className="h-10 w-40" />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="rounded" className="h-96 w-full rounded-3xl" />
          <Skeleton variant="rounded" className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('planning.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t('planning.subtitle')}
          </p>
        </div>

        <div className="md:hidden flex items-center justify-between w-full bg-white dark:bg-slate-900 p-4 pl-16 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              {t('sidebar.current_balance')}
            </span>
            <span className={`text-xl font-black leading-none ${Number(summary?.netBalance || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {summary ? formatCurrency(summary.netBalance) : '...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SyncStatus />
            <Link
              to="/settings"
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              aria-label={t('auth.access_settings')}
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <SyncStatus />
          </div>
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-2xl font-bold hover:bg-purple-200 transition-colors shadow-sm"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">{t('planning.simulate_purchase')}</span>
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {(Number(summary.budgetLimit) || 0) > 0 && (
            <BudgetWidget
              currentExpense={Number(summary.currentMonthExpense) || 0}
              budgetLimit={Number(summary.budgetLimit) || 0}
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
          <div className="h-[400px]">
            <ExpensesTreemap transactions={transactions} />
          </div>
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