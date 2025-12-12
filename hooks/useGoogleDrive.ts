import { useEffect, useRef } from 'react';
import { useSettingsQuery } from './useFinanceData';
import { uploadBackupToAppData } from '../services/googleDrive';
import { updateSettings } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const useGoogleAutoBackup = () => {
    const { data: settings } = useSettingsQuery();
    const { isAuthenticated, token } = useAuth();
    useToast(); // Mantendo o hook se necessário para efeitos colaterais, ou remover se não tiver. O erro era 'addToast' unused.
    const hasRun = useRef(false);

    useEffect(() => {
        // Só roda se estiver autenticado, tiver token e configurações carregadas
        if (!isAuthenticated || !token || !settings) return;

        // Evita rodar múltiplas vezes na mesma sessão (debounce simples)
        if (hasRun.current) return;

        const checkBackup = async () => {
            try {
                const lastRun = settings.googleDrive?.lastBackup ? new Date(settings.googleDrive.lastBackup).getTime() : 0;
                const now = new Date().getTime();
                
                // Intervalo de 24h (86400000 ms)
                // Se o último backup foi há mais de 24h, executa
                if (now - lastRun > 86400000) {
                    hasRun.current = true; // Marca como rodando
                    
                    console.log('[AutoBackup] Iniciando backup em segundo plano...');
                    
                    // Tenta fazer o upload
                    await uploadBackupToAppData(token);
                    
                    // Atualiza timestamp
                    await updateSettings({
                        ...settings,
                        googleDrive: { 
                            ...settings.googleDrive!, // Mantém configs existentes
                            enabled: true, // Garante que está marcado como ativo
                            lastBackup: new Date().toISOString(),
                            // Limpa campos legacy se existirem para evitar confusão
                            clientId: settings.googleDrive?.clientId || '',
                            frequency: settings.googleDrive?.frequency || 'daily'
                        }
                    });
                    
                    console.log('[AutoBackup] Sucesso!');
                }
            } catch (e) {
                console.error('[AutoBackup] Falha silenciosa:', e);
                // Opcional: Adicionar toast de erro se quiser que o usuário saiba, 
                // mas para background tasks, melhor falhar em silêncio ou logar.
                // addToast('Falha no backup automático', 'error');
            }
        };

        checkBackup();
    }, [isAuthenticated, token, settings]); // Re-run se o usuário logar ou settings mudarem
};