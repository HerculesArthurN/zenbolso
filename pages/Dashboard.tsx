import React from 'react';
import { useData } from '../context/DataContext';
import { useSummaryQuery, useInsights, useBadges, useTransactionsQuery, useAccountsQuery, useFinanceMutations } from '../hooks/useFinanceData';
import { Skeleton } from '../components/ui/Skeleton';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { InsightsWidget } from '../components/dashboard/InsightsWidget';
import { BenchmarkWidget } from '../components/dashboard/BenchmarkWidget';
import { AchievementsWidget } from '../components/dashboard/AchievementsWidget';
import { AccountsWidget } from '../components/dashboard/AccountsWidget';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';

export const Dashboard: React.FC = () => {
  const { refreshAll } = useFinanceMutations();
  
  const { data: summary, isLoading: loadingSummary } = useSummaryQuery();
  const { data: transactions = [] } = useTransactionsQuery();
  const { data: accounts = [] } = useAccountsQuery();
  const insights = useInsights();
  const badges = useBadges();
  
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);

  const loading = loadingSummary;

  React.useEffect(() => {
    const hasData = transactions.length > 0 || accounts.length > 1;
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
    
    if (!loading && !hasData && !hasSeenOnboarding) {
        setIsOnboardingOpen(true);
    }
  }, [loading, transactions, accounts]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsOnboardingOpen(false);
    refreshAll();
  };

  if (loading || !summary) {
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