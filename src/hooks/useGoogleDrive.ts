import { useEffect, useRef } from 'react';
import { useSettingsQuery } from './useFinanceData';
import { uploadBackupToAppData } from '../services/googleDrive';
import { updateSettings } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/SessionContext';

export const useGoogleAutoBackup = () => {
    const { data: settings } = useSettingsQuery();
    const { user } = useAuth();
    const isAuthenticated = !!user;
    useToast();
    const hasRun = useRef(false);

    useEffect(() => {
        const check = async () => {
            // Só roda se estiver autenticado e settings carregadas
            if (!isAuthenticated || !settings) return;

            // Get token manually since it's not in context
            const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());
            const token = session?.access_token;
            if (!token) return;

            // Evita rodar múltiplas vezes na mesma sessão
            if (hasRun.current) return;

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
            }
        };

        check();
    }, [isAuthenticated, settings]); // Re-run se o usuário logar ou settings mudarem
};