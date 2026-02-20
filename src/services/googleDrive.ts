import { getTransactions, getAccounts, getCategories, getRecurringConfigs, getGoals, getSettings, clearAllData } from './api';
import { AppSettings } from '../types';

const BACKUP_FILE_NAME = 'pocket_manager_full_backup.json';

// --- Métodos Auxiliares de API do Drive ---

/**
 * Busca o arquivo de backup na pasta oculta do app (appDataFolder)
 */
export const findBackupFile = async (accessToken: string) => {
  const query = `name = '${BACKUP_FILE_NAME}' and 'appDataFolder' in parents and trashed = false`;
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=appDataFolder&fields=files(id, name, modifiedTime)`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!response.ok) throw new Error('Falha ao buscar backup no Drive');
  const data = await response.json();
  return data.files && data.files.length > 0 ? data.files[0] : null;
};

/**
 * Baixa o conteúdo do arquivo de backup
 */
export const downloadBackupFile = async (fileId: string, accessToken: string) => {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error('Falha ao baixar backup');
  return await response.json();
};

/**
 * Cria ou Atualiza o backup na appDataFolder
 */
export const uploadBackupToAppData = async (accessToken: string) => {
  // 1. Coletar todos os dados para um backup completo (JSON)
  const [transactions, accounts, categories, recurring, goals, settings] = await Promise.all([
      getTransactions(),
      getAccounts(),
      getCategories(),
      getRecurringConfigs(),
      getGoals(),
      getSettings()
  ]);

  const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: { transactions, accounts, categories, recurring, goals, settings }
  };

  const fileContent = JSON.stringify(backupData);
  const file = new Blob([fileContent], { type: 'application/json' });
  
  // 2. Verificar se já existe
  const existingFile = await findBackupFile(accessToken);

  const metadata = {
      name: BACKUP_FILE_NAME,
      mimeType: 'application/json',
      parents: existingFile ? undefined : ['appDataFolder'] // Só define pai na criação
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const method = existingFile ? 'PATCH' : 'POST';
  const url = existingFile 
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

  const response = await fetch(url, {
      method: method,
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: form
  });

  if (!response.ok) throw new Error('Falha ao enviar backup para appDataFolder');
  return await response.json();
};

/**
 * Restaura os dados do JSON para o Dexie
 */
export const restoreFromBackupData = async (backupJson: any) => {
    if (!backupJson || !backupJson.data) throw new Error("Formato de backup inválido");

    const { transactions, accounts, categories, recurring, goals, settings } = backupJson.data;

    // Limpa banco local para evitar duplicação/conflito na restauração total
    await clearAllData();

    // Restaura tabelas
    const { db } = await import('../services/db'); // Import dinâmico para evitar ciclo se houver
    
    await (db as any).transaction('rw', db.transactions, db.accounts, db.categories, db.recurringConfigs, db.goals, db.settings, async () => {
        if (accounts?.length) await db.accounts.bulkAdd(accounts);
        if (categories?.length) await db.categories.bulkAdd(categories);
        if (recurring?.length) await db.recurringConfigs.bulkAdd(recurring);
        if (goals?.length) await db.goals.bulkAdd(goals);
        if (settings) await db.settings.put({ ...settings, id: 'global_settings' });
        if (transactions?.length) await db.transactions.bulkAdd(transactions);
    });
};

// --- Legado (Manter compatibilidade se necessário, ou remover futuramente) ---
// Prefixamos com _ para indicar unused parameters ao TS

export const initGoogleClient = (_clientId: string, _callback: (response: any) => void) => {
  // Deprecated implementation kept for compatibility
};
export const requestAccessToken = () => {
    // Deprecated implementation kept for compatibility
};
export const uploadToDrive = async (_accessToken: string) => {
    // Deprecated implementation kept for compatibility
};
export const checkAndRunBackup = async (_settings: AppSettings, _onStatusChange: (status: string) => void) => {
    // Deprecated implementation kept for compatibility
};