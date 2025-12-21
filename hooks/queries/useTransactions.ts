import { useQuery } from '@tanstack/react-query';
import { TransactionRepository } from '../../services/repositories/transaction.repository';


export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: 'all' | 'income' | 'expense';
  category?: string;
  tags?: string[];
  searchQuery?: string;
}

export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', {
      start: filters?.startDate,
      end: filters?.endDate
    }],
    queryFn: async () => {
      // 1. Busca eficiente no DB (Filtragem por data)
      const data = await TransactionRepository.findAll({
        start: filters?.startDate,
        end: filters?.endDate
      });

      // 2. Filtragem em Memória (Tipos, Categorias, Texto)
      // Mantemos filtros complexos em memória para simplificar a query do IndexedDB
      if (!filters) return data;

      return data.filter(t => {
        if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false;
        if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;

        if (filters.tags && filters.tags.length > 0) {
          if (!t.tags || t.tags.length === 0) return false;
          const hasMatchingTag = filters.tags.some(tag => t.tags?.includes(tag));
          if (!hasMatchingTag) return false;
        }

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          const matchesCategory = t.category.toLowerCase().includes(query);
          const matchesDescription = t.description?.toLowerCase().includes(query) || false;
          if (!matchesCategory && !matchesDescription) return false;
        }

        return true;
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache fresco
  });
};