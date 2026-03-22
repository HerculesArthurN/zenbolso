import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRecurringTransactions } from '../useRecurringTransactions';
import { recurringService } from '../../services/recurringService';

// Mock do service para isolamento militar da camada de banco de dados
vi.mock('../../services/recurringService', () => ({
  recurringService: {
    getRecurring: vi.fn().mockResolvedValue([
      { id: 'rec-1', description: 'Netflix', amount: 39.90 },
      { id: 'rec-2', description: 'Academia', amount: 120.00 }
    ]),
    addRecurring: vi.fn().mockResolvedValue({ id: 'rec-3', description: 'Spotify', amount: 21.90 }),
    deleteRecurring: vi.fn().mockResolvedValue(true)
  },
}));

describe('useRecurringTransactions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com array vazio e carregar as transações ativas', async () => {
    const { result } = renderHook(() => useRecurringTransactions());

    // Estado inicial síncrono
    expect(result.current.isLoading).toBe(true);
    expect(result.current.transactions).toEqual([]);

    // Aguarda a resolução do useEffect interno
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.transactions).toHaveLength(2);
    expect(recurringService.getRecurring).toHaveBeenCalledTimes(1);
  });

  it('deve adicionar uma nova transação recorrente e atualizar a lista', async () => {
    const { result } = renderHook(() => useRecurringTransactions());

    // Aguarda o carregamento inicial
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addTransaction({
        description: 'Spotify',
        amount: 21.90,
        frequency: 'MONTHLY'
      } as any); // Tipagem mockada para o teste
    });

    // Garante que o service foi chamado
    expect(recurringService.addRecurring).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Spotify' })
    );
    // A lista local deve ter sido atualizada (UI Otimista/Re-fetch)
    expect(result.current.transactions).toHaveLength(3);
  });

  it('deve cancelar uma transação e removê-la da lista visual', async () => {
    const { result } = renderHook(() => useRecurringTransactions());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.cancelTransaction('rec-1');
    });

    expect(recurringService.deleteRecurring).toHaveBeenCalledWith('rec-1');
    // A transação 'rec-1' deve sumir da lista
    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].id).toBe('rec-2');
  });
});
