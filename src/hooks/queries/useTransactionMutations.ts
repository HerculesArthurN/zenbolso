import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../../services/transactionService';
import { Transaction } from '../../types';
import { useToast } from '../../contexts/ToastContext';

export const useTransactionMutations = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const invalidateFinanceQueries = () => {
    // Invalida todas as queries que dependem de transações
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
    queryClient.invalidateQueries({ queryKey: ['forecast'] });
    queryClient.invalidateQueries({ queryKey: ['annual'] });
  };

  const addTransaction = useMutation({
    // Aceita Transaction completa (se ID gerado no form) ou Omit<ID>
    mutationFn: async (t: Transaction | Omit<Transaction, 'id'>) => {
      if ('id' in t) {
        await transactionService.updateTransaction((t as Transaction).id, t);
      } else {
        await transactionService.createTransaction(t);
      }
    },
    onSuccess: () => {
      invalidateFinanceQueries();
    },
    onError: (error: any) => {
      console.error(error);
      addToast('Erro ao salvar transação.', 'error');
    }
  });

  const updateTransaction = useMutation({
    mutationFn: (t: Transaction) => transactionService.updateTransaction(t.id, t),
    onSuccess: () => {
      invalidateFinanceQueries();
    },
    onError: (error: any) => {
      console.error(error);
      addToast('Erro ao atualizar transação.', 'error');
    }
  });

  const deleteTransaction = useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      invalidateFinanceQueries();
    },
    onError: (error: any) => {
      console.error(error);
      addToast('Erro ao remover transação.', 'error');
    }
  });

  return {
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};