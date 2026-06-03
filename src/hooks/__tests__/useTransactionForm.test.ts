import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTransactionForm } from '../useTransactionForm';
import { transactionService } from '../../services/transactionService';

// Mock do service para isolar a camada de banco de dados
vi.mock('../../services/transactionService', () => ({
  transactionService: {
    createTransaction: vi.fn().mockResolvedValue({ id: 'test-uuid-123' }),
  },
}));

// Mock do Toast e outras dependências para o teste não quebrar se o hook ainda usar coisas antigas
vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() })
}));
vi.mock('../useFinanceData', () => ({
  useAccountsQuery: () => ({ data: [] }),
  useCategoriesQuery: () => ({ data: [] }),
  useFinanceMutations: () => ({ refreshTransactions: vi.fn() })
}));

describe('useTransactionForm Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com o estado de formulário vazio e válido', () => {
    const { result } = renderHook(() => useTransactionForm());
    expect(result.current.formData.amount).toBe(0);
    expect(result.current.formData.description).toBe('');
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('não deve submeter a transação se a validação falhar (campos vazios)', async () => {
    const { result } = renderHook(() => useTransactionForm());

    await act(async () => {
      // Tentando submeter sem preencher os dados
      await result.current.submitTransaction();
    });

    expect(result.current.errors).toHaveProperty('amount');
    expect(result.current.errors).toHaveProperty('description');
    expect(transactionService.createTransaction).not.toHaveBeenCalled();
  });

  it('deve submeter a transação e limpar o formulário se os dados forem válidos', async () => {
    const { result } = renderHook(() => useTransactionForm());

    // Preenchendo o formulário
    act(() => {
      result.current.updateField('amount', 150);
      result.current.updateField('description', 'Compra no mercado');
      result.current.updateField('type', 'EXPENSE');
      result.current.updateField('categoryId', 'cat-1');
      result.current.updateField('accountId', 'acc-1');
    });

    await act(async () => {
      const success = await result.current.submitTransaction();
      expect(success).toBe(true);
    });

    // Garante que o service foi chamado corretamente
    expect(transactionService.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 15000,
        description: 'Compra no mercado',
        type: 'EXPENSE'
      })
    );

    // Garante o reset do form após o sucesso
    expect(result.current.formData.amount).toBe(0);
    expect(result.current.formData.description).toBe('');
  });
});
