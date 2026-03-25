import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppLock } from '../useAppLock';
import { securityService } from '../../services/securityService';

// Mock do serviço criptográfico
vi.mock('../../services/securityService', () => ({
  securityService: {
    hasPinSetup: vi.fn().mockResolvedValue(true),
    verifyPin: vi.fn().mockResolvedValue(true),
    setupPin: vi.fn().mockResolvedValue(true),
    removePin: vi.fn().mockResolvedValue(true),
  },
}));

describe('useAppLock Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar bloqueado se o usuário configurou um PIN anteriormente', async () => {
    const { result } = renderHook(() => useAppLock());

    expect(result.current.isChecking).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isChecking).toBe(false);
    expect(result.current.isLocked).toBe(true); // A porta deve estar trancada!
  });

  it('deve desbloquear o app se o PIN fornecido estiver correto', async () => {
    const { result } = renderHook(() => useAppLock());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      const success = await result.current.unlockApp('1234');
      expect(success).toBe(true);
    });

    expect(securityService.verifyPin).toHaveBeenCalledWith('1234');
    expect(result.current.isLocked).toBe(false);
  });

  it('deve manter o bloqueio e retornar erro se o PIN for inválido', async () => {
    // Sobrescrevendo o mock para simular erro de senha
    vi.mocked(securityService.verifyPin).mockResolvedValueOnce(false);
    const { result } = renderHook(() => useAppLock());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      const success = await result.current.unlockApp('0000');
      expect(success).toBe(false);
    });

    expect(result.current.isLocked).toBe(true);
  });
});
