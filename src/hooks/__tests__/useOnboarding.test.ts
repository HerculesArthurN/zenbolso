import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOnboarding } from '../useOnboarding';
import { settingsService } from '../../services/settingsService';
import { seedService } from '../../services/seedService';

// Mock do service de configurações (Persistência da flag)
vi.mock('../../services/settingsService', () => ({
  settingsService: {
    getOnboardingFlag: vi.fn().mockResolvedValue(false), // Por padrão, simula o 1º acesso
    setOnboardingFlag: vi.fn().mockResolvedValue(true),
  },
}));

// Mock da Fábrica de Dados
vi.mock('../../services/seedService', () => ({
  seedService: {
    injectMockData: vi.fn().mockResolvedValue(true),
  },
}));

describe('useOnboarding Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar como "loading" e depois mostrar o onboarding no 1º acesso', async () => {
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.isLoading).toBe(true); // Evita flash da tela principal

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.showOnboarding).toBe(true);
    expect(settingsService.getOnboardingFlag).toHaveBeenCalledTimes(1);
  });

  it('deve completar o onboarding, salvar a flag e esconder a tela', async () => {
    const { result } = renderHook(() => useOnboarding());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(settingsService.setOnboardingFlag).toHaveBeenCalledWith(true);
    expect(result.current.showOnboarding).toBe(false);
    expect(seedService.injectMockData).not.toHaveBeenCalled(); // Não gerou dados
  });

  it('deve injetar dados de teste, salvar a flag e esconder a tela', async () => {
    const { result } = renderHook(() => useOnboarding());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.generateSeedDataAndComplete();
    });

    expect(seedService.injectMockData).toHaveBeenCalledTimes(1);
    expect(settingsService.setOnboardingFlag).toHaveBeenCalledWith(true);
    expect(result.current.showOnboarding).toBe(false);
  });
});
