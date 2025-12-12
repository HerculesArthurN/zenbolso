import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { 
  getTransactions, 
  getDashboardSummary, 
  getAccounts, 
  getCategories, 
  getForecastData, 
  getAnnualSummary,
  getRecurringConfigs,
  getSettings
} from '../services/api';
import { generateInsights } from '../services/insights';
import { calculateBadges } from '../services/gamification';

// Keys para invalidação de cache
export const QUERY_KEYS = {
  transactions: ['transactions'],
  summary: ['summary'],
  accounts: ['accounts'],
  categories: ['categories'],
  forecast: ['forecast'],
  annual: ['annual'],
  recurring: ['recurring'],
  settings: ['settings'],
};

export const useTransactionsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: getTransactions,
  });
};

export const useSummaryQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.summary,
    queryFn: getDashboardSummary,
  });
};

export const useAccountsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.accounts,
    queryFn: getAccounts,
  });
};

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: getCategories,
  });
};

export const useSettingsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.settings,
    queryFn: getSettings,
  });
};

export const useForecastQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.forecast,
    queryFn: getForecastData,
  });
};

export const useAnnualSummaryQuery = (year: number) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.annual, year],
    queryFn: () => getAnnualSummary(year),
  });
};

export const useRecurringConfigsQuery = () => {
    return useQuery({
        queryKey: QUERY_KEYS.recurring,
        queryFn: getRecurringConfigs
    })
}

// --- Hooks Derivados (Domain Logic) ---

export const useInsights = () => {
    const { data: transactions = [] } = useTransactionsQuery();
    const { data: summary } = useSummaryQuery();
    
    return useMemo(() => {
        if (!summary) return [];
        return generateInsights(transactions, summary);
    }, [transactions, summary]);
};

export const useBadges = () => {
    const { data: transactions = [] } = useTransactionsQuery();
    const { data: summary } = useSummaryQuery();
    
    return useMemo(() => {
        if (!summary) return [];
        return calculateBadges(transactions, summary);
    }, [transactions, summary]);
};

// --- Mutações ---

export const useFinanceMutations = () => {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    return queryClient.invalidateQueries();
  };

  const refreshTransactions = () => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.summary }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.forecast }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.annual }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings }),
    ]);
  };

  return { refreshAll, refreshTransactions };
};