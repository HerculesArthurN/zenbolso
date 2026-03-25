import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePinSetup } from '../usePinSetup';
import { securityService } from '../../services/securityService';

// Mock do nosso serviço recém-forjado
vi.mock('../../services/securityService', () => ({
  securityService: {
    setupPin: vi.fn().mockResolvedValue(true),
  },
}));

describe('usePinSetup Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar no passo 1 (Criação) e sem erros', () => {
    const { result } = renderHook(() => usePinSetup());
    expect(result.current.step).toBe('CREATE');
    expect(result.current.error).toBe(false);
  });

  it('deve avançar para o passo 2 (Confirmação) ao submeter o primeiro PIN', () => {
    const { result } = renderHook(() => usePinSetup());

    act(() => {
      result.current.submitPin('1234');
    });

    expect(result.current.step).toBe('CONFIRM');
    expect(result.current.error).toBe(false);
  });

  it('deve retornar erro e resetar se a confirmação for diferente do primeiro PIN', () => {
    const { result } = renderHook(() => usePinSetup());

    act(() => {
      result.current.submitPin('1234'); // Passo 1
    });

    act(() => {
      result.current.submitPin('4321'); // Passo 2 (Erro proposital)
    });

    expect(result.current.step).toBe('CREATE'); // Voltou pro início
    expect(result.current.error).toBe(true); // Disparou o erro
    expect(securityService.setupPin).not.toHaveBeenCalled();
  });

  it('deve salvar o PIN no securityService se a confirmação for exata', async () => {
    const { result } = renderHook(() => usePinSetup());

    act(() => {
      result.current.submitPin('9999'); // Passo 1
    });

    await act(async () => {
      await result.current.submitPin('9999'); // Passo 2 (Sucesso)
    });

    expect(securityService.setupPin).toHaveBeenCalledWith('9999');
    expect(result.current.isSuccess).toBe(true);
  });
});
