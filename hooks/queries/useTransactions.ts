import { useQuery } from '@tanstack/react-query';
import { TransactionRepository } from '../../services/repositories/TransactionRepository';
import { Transaction } from '../../types';

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
    // Chave composta: 'transactions' + filtros. 
    // Se o filtro mudar (ex: mudar o mês), o React Query busca automaticamente.
    queryKey: ['transactions', { 
        start: filters?.startDate, 
        end: filters?.endDate 
    }],
    queryFn: async () => {
      let data: Transaction[] = [];

      // 1. Filtragem eficiente no Banco de Dados (Date Range)
      if (filters?.startDate && filters?.endDate) {
        data = await TransactionRepository.getByDateRange(filters.startDate, filters.endDate);
      } else {
        data = await TransactionRepository.getAll();
      }

      // 2. Filtragem em Memória (Tipos, Categorias, Texto)
      // O Dexie suporta filtros complexos, mas para este volume de dados, 
      // filtrar o restante em memória mantém o código simples e rápido o suficiente.
      return data.filter(t => {
        if (filters?.type && filters.type !== 'all' && t.type !== filters.type) return false;
        if (filters?.category && filters.category !== 'all' && t.category !== filters.category) return false;
        
        if (filters?.tags && filters.tags.length > 0) {
            if (!t.tags || t.tags.length === 0) return false;
            const hasMatchingTag = filters.tags.some(tag => t.tags?.includes(tag));
            if (!hasMatchingTag) return false;
        }

        if (filters?.searchQuery) {
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