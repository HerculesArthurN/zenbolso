import { securityService } from '../services/securityService';
import { db } from '../services/db';

export function useGhostProtocol() {
  const executeWipeout = async () => {
    try {
      // 1. Desarma a fechadura criptográfica
      await securityService.removePin();
      
      // 2. Limpa todas as flags (Onboarding, Tema, etc)
      localStorage.clear();
      
      // 3. Obliterar o banco de dados Dexie (O coração)
      await db.delete();
      
      // Recria a estrutura vazia para não quebrar a UI antes do reload
      await db.open();

      // 4. Força o recarregamento total para limpar a memória RAM do React
      window.location.reload();
    } catch (error) {
      console.error('Falha ao executar o Protocolo Fantasma:', error);
    }
  };

  return { executeWipeout };
}
