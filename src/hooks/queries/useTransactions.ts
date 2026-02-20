import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../../services/transactionService';
import { Transaction } from '../../types';

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: 'all' | 'INCOME' | 'EXPENSE';
  category?: string;
  searchQuery?: string;
}

export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', {
      start: filters?.startDate,
      end: filters?.endDate
    }],
    queryFn: async () => {
      // 1. Fetch all transactions (the service handles limit)
      const data = await transactionService.fetchTransactions(500);

      // 2. In-memory filtering
      if (!filters) return data;

      return data.filter((t: Transaction) => {
        if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false;
        if (filters.category && filters.category !== 'all' && t.category_id !== filters.category) return false;

        if (filters.startDate && t.date < filters.startDate) return false;
        if (filters.endDate && t.date > filters.endDate) return false;

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          const matchesDescription = t.description?.toLowerCase().includes(query) || false;
          if (!matchesDescription) return false;
        }

        return true;
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes of fresh cache
  });
};