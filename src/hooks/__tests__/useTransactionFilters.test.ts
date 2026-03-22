import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTransactionFilters } from '../useTransactionFilters';
import * as datePresets from '../../utils/datePresets';

describe('useTransactionFilters Hook', () => {
  beforeEach(() => {
    // Congelamos o tempo para testes de data serem determinísticos
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve inicializar com o estado padrão (Mês Atual)', () => {
    const { result } = renderHook(() => useTransactionFilters());
    
    // O padrão deve ser o mês atual
    expect(result.current.filters.startDate).toBeDefined();
    expect(result.current.filters.endDate).toBeDefined();
    expect(result.current.filters.type).toBeUndefined();
    expect(result.current.filters.categoryId).toBeUndefined();
  });

  it('deve atualizar um filtro individualmente', () => {
    const { result } = renderHook(() => useTransactionFilters());

    act(() => {
      result.current.setFilter('type', 'EXPENSE');
    });

    expect(result.current.filters.type).toBe('EXPENSE');
    // As datas não devem ter sido alteradas
    expect(result.current.filters.startDate).toBeDefined();
  });

  it('deve aplicar um preset de data corretamente (Ex: Últimos 7 dias)', () => {
    const { result } = renderHook(() => useTransactionFilters());

    // Mockamos a função pura para garantir que o hook a está chamando corretamente
    const presetSpy = vi.spyOn(datePresets, 'getLast7Days').mockReturnValue({
      startDate: new Date('2026-03-15T00:00:00Z'),
      endDate: new Date('2026-03-21T23:59:59Z')
    });

    act(() => {
      result.current.applyDatePreset('LAST_7_DAYS');
    });

    expect(presetSpy).toHaveBeenCalled();
    expect(result.current.filters.startDate).toEqual(new Date('2026-03-15T00:00:00Z'));
    expect(result.current.filters.endDate).toEqual(new Date('2026-03-21T23:59:59Z'));
  });

  it('deve limpar todos os filtros e voltar ao estado inicial', () => {
    const { result } = renderHook(() => useTransactionFilters());

    act(() => {
      result.current.setFilter('categoryId', 'cat-1');
      result.current.setFilter('type', 'INCOME');
      result.current.clearFilters();
    });

    expect(result.current.filters.categoryId).toBeUndefined();
    expect(result.current.filters.type).toBeUndefined();
    // As datas devem voltar para o padrão (Mês Atual)
    expect(result.current.filters.startDate).toBeDefined();
  });
});
