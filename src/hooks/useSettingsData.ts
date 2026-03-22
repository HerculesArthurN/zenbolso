import { useState } from 'react';
import { db } from '../services/db';

// Tipo literal das abas disponíveis no SettingsModal
export type SettingsTab = 'general' | 'accounts' | 'categories' | 'recurring' | 'cloud' | 'data';

interface UseSettingsDataReturn {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
  resetApp: () => Promise<void>;
}

/**
 * Hook responsável pelo estado e ações de controle do SettingsModal.
 *
 * Golden Rule Guard: A função `resetApp` SEMPRE deve deletar o IndexedDB
 * via `db.delete()` antes de qualquer outra ação. localStorage é apenas
 * um complemento para dados legados/cache.
 *
 * @see AI Memory (GEMINI.md) — Reset / Persistência — 2026-03-22
 */
export function useSettingsData(): UseSettingsDataReturn {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  /**
   * Hard Reset: apaga TODOS os dados do usuário.
   * Ordem obrigatória:
   *   1. db.delete() — apaga o IndexedDB inteiro (fonte de verdade)
   *   2. db.open()  — recria o schema vazio (permite novo populate/seed)
   *   3. localStorage.clear() — limpa cache e dados legados
   *   4. window.location.reload() — reinicia o app
   *
   * Se db.delete() falhar, a operação é abortada para evitar estado inconsistente.
   */
  const resetApp = async (): Promise<void> => {
    try {
      await db.delete();
      await db.open();
      localStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('[useSettingsData] resetApp failed:', error);
      // Não propaga: a UI deve lidar com o erro via try/catch externo
    }
  };

  return {
    activeTab,
    setActiveTab,
    resetApp,
  };
}
