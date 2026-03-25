import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGhostProtocol } from '../useGhostProtocol';
import { securityService } from '../../services/securityService';
import { db } from '../../services/db';

// Mocks táticos
vi.mock('../../services/securityService', () => ({
  securityService: {
    removePin: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('../../services/db', () => ({
  db: {
    delete: vi.fn().mockResolvedValue(undefined),
    open: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('useGhostProtocol Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve executar a destruição total (Dexie + PIN + LocalStorage)', async () => {
    // Espionamos o localStorage
    const storageSpy = vi.spyOn(Storage.prototype, 'clear');
    const { result } = renderHook(() => useGhostProtocol());

    await act(async () => {
      await result.current.executeWipeout();
    });

    // 1. O PIN deve ser removido
    expect(securityService.removePin).toHaveBeenCalledTimes(1);
    
    // 2. O Banco de Dados deve ser obliterado e reaberto
    expect(db.delete).toHaveBeenCalledTimes(1);
    expect(db.open).toHaveBeenCalledTimes(1);

    // 3. O Storage local (flags de onboarding, etc) limpo
    expect(storageSpy).toHaveBeenCalledTimes(1);
  });
});
