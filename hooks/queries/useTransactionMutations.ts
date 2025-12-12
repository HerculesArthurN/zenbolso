import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionRepository } from '../../services/repositories/TransactionRepository';
import { Transaction } from '../../types';
import { useToast } from '../../context/ToastContext';

export const useTransactionMutations = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const addTransaction = useMutation({
    mutationFn: (t: Transaction) => TransactionRepository.add(t),
    onSuccess: () => {
      // Invalida 'transactions' (lista) e 'summary' (saldo/dashboard)
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['forecast'] });
    },
    onError: (error: any) => {
      console.error(error);
      addToast('Erro ao salvar transação.', 'error');
    }
  });

  const updateTransaction = useMutation({
    mutationFn: (t: Transaction) => TransactionRepository.update(t),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['forecast'] });
    },
    onError: (error: any) => {
      addToast('Erro ao atualizar transação.', 'error');
    }
  });

  const deleteTransaction = useMutation({
    mutationFn: (id: string) => TransactionRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: any) => {
      addToast('Erro ao remover transação.', 'error');
    }
  });

  return {
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};