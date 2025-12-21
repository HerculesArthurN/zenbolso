import React from 'react';
import { useSummaryQuery, useInsights, useBadges, useAccountsQuery, useFinanceMutations } from '../hooks/useFinanceData';
import { useTransactions } from '../hooks/queries/useTransactions'; // Novo Hook
import { Skeleton } from '../components/ui/Skeleton';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { InsightsWidget } from '../components/dashboard/InsightsWidget';
import { BenchmarkWidget } from '../components/dashboard/BenchmarkWidget';
import { AchievementsWidget } from '../components/dashboard/AchievementsWidget';
import { AccountsWidget } from '../components/dashboard/AccountsWidget';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { ExpensesDonut } from '../components/charts/ExpensesDonut';
import { ExpensesTreemap } from '../components/dashboard/ExpensesTreemap';

export const Dashboard: React.FC = () => {
  const { refreshAll } = useFinanceMutations();

  const { data: summary, isLoading: loadingSummary } = useSummaryQuery();
  // Usando o novo hook com filtros para o mês atual, se desejado, ou todos
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccountsQuery();
  const insights = useInsights();
  const badges = useBadges();

  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);

  React.useEffect(() => {
    const hasData = transactions.length > 0 || accounts.length > 1;
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');

    if (!loadingSummary && !hasData && !hasSeenOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, [loadingSummary, transactions, accounts]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsOnboardingOpen(false);
    refreshAll();
  };

  if (loadingSummary || !summary) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rounded" className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="rounded" className="h-32 w-full rounded-2xl" />
          <Skeleton variant="rounded" className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Visão Geral</h1>
        <p className="text-slate-500 text-sm">Bem-vindo de volta ao seu controle financeiro.</p>
      </header>

      <BalanceCard
        netBalance={summary.netBalance}
        income={summary.totalIncome}
        expense={summary.totalExpense}
      />

      {/* Seção de Gráficos e Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <ExpensesDonut transactions={transactions} />
        </div>
        <div className="h-[400px]">
          <ExpensesTreemap transactions={transactions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.length > 0 && <InsightsWidget insights={insights} />}
        <BenchmarkWidget transactions={transactions} />
      </div>

      {badges.length > 0 && <AchievementsWidget badges={badges} />}

      <AccountsWidget accounts={summary.accounts} />

      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};
