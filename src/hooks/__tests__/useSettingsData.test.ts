import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSettingsData } from '../useSettingsData';
import { db } from '../../services/db';

// --- Mocks ---

// Mock completo do Dexie para nunca tocar no IndexedDB real
vi.mock('../../services/db', () => ({
  db: {
    delete: vi.fn().mockResolvedValue(undefined),
    open: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock de window.location.reload para evitar erros no jsdom
const reloadMock = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: reloadMock },
  writable: true,
});

// --- Suíte de Testes ---

describe('useSettingsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Controle de Abas ---

  describe('controle de abas', () => {
    it('deve inicializar com a aba "general" por padrão', () => {
      const { result } = renderHook(() => useSettingsData());
      expect(result.current.activeTab).toBe('general');
    });

    it('deve alterar a aba ativa para "data"', () => {
      const { result } = renderHook(() => useSettingsData());

      act(() => {
        result.current.setActiveTab('data');
      });

      expect(result.current.activeTab).toBe('data');
    });

    it('deve alterar a aba ativa para "accounts"', () => {
      const { result } = renderHook(() => useSettingsData());

      act(() => {
        result.current.setActiveTab('accounts');
      });

      expect(result.current.activeTab).toBe('accounts');
    });
  });

  // --- Reset do Aplicativo (Golden Rule Guard) ---

  describe('resetApp', () => {
    it('deve chamar db.delete() para limpar o IndexedDB — NUNCA só o localStorage', async () => {
      const { result } = renderHook(() => useSettingsData());

      await act(async () => {
        await result.current.resetApp();
      });

      // 🔴→🟢 GOLDEN RULE: Dexie DEVE ser deletado, garantindo que os dados reais são apagados
      expect(db.delete).toHaveBeenCalledTimes(1);
    });

    it('deve chamar db.open() após db.delete() para recriar o schema vazio', async () => {
      const { result } = renderHook(() => useSettingsData());

      await act(async () => {
        await result.current.resetApp();
      });

      // A ordem importa: delete antes de open
      const deleteMock = vi.mocked(db.delete);
      const openMock = vi.mocked(db.open);

      expect(deleteMock).toHaveBeenCalledTimes(1);
      expect(openMock).toHaveBeenCalledTimes(1);

      // Garante a ordem correta: delete → open
      expect(deleteMock.mock.invocationCallOrder[0]).toBeLessThan(
        openMock.mock.invocationCallOrder[0]
      );
    });

    it('deve limpar o localStorage como complemento (dados legados/cache)', async () => {
      const clearSpy = vi.spyOn(Storage.prototype, 'clear');
      const { result } = renderHook(() => useSettingsData());

      await act(async () => {
        await result.current.resetApp();
      });

      expect(clearSpy).toHaveBeenCalledTimes(1);
    });

    it('deve chamar window.location.reload() ao final do reset', async () => {
      const { result } = renderHook(() => useSettingsData());

      await act(async () => {
        await result.current.resetApp();
      });

      expect(reloadMock).toHaveBeenCalledTimes(1);
    });

    it('NÃO deve chamar db.open() se db.delete() lançar um erro', async () => {
      vi.mocked(db.delete).mockRejectedValueOnce(new Error('Dexie delete failed'));
      const { result } = renderHook(() => useSettingsData());

      await act(async () => {
        await result.current.resetApp();
      });

      // Se delete falhou, open não deve ser chamado
      expect(db.open).not.toHaveBeenCalled();
    });
  });
});
