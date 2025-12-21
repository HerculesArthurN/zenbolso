import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { findBackupFile, downloadBackupFile, restoreFromBackupData, uploadBackupToAppData } from '../services/googleDrive';
import { useToast } from './ToastContext';
import { useFinanceMutations } from '../hooks/useFinanceData';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: () => void;
  logout: () => void;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User é opcional (Progressive Auth)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('google_access_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const { addToast } = useToast();
  const { refreshAll } = useFinanceMutations();

  // Debug Origin for Google Console mismatch check
  useEffect(() => {
    // Apenas informativo
    console.log('[Auth] Current Origin:', window.location.origin);
  }, []);

  const logout = () => {
    googleLogout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('user_profile');

    // Não removemos 'setup_completed' pois o app deve continuar funcionando offline/deslogado.

    setSyncStatus('idle');
    addToast('Google Drive desconectado.', 'info');
  };

  // Função auxiliar para obter perfil
  const fetchProfile = async (accessToken: string) => {
    try {
      const res = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`, {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('Token expired or invalid');
      }

      if (!res.ok) throw new Error('Falha ao obter perfil');
      const profile = await res.json();
      setUser(profile);
      localStorage.setItem('user_profile', JSON.stringify(profile));
      return profile;
    } catch (e) {
      console.error('[Auth] Profile Fetch Error:', e);
      // Se o token for inválido, apenas desconectamos a sessão Google
      logout();
    }
  };

  // Tenta restaurar a sessão Google se houver token salvo
  useEffect(() => {
    const storedToken = localStorage.getItem('google_access_token');
    const storedUser = localStorage.getItem('user_profile');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Valida o token em background
      fetchProfile(storedToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSyncInitial = async (accessToken: string) => {
    setSyncStatus('syncing');
    try {
      // 1. Procura backup na AppData (Pasta oculta)
      const backupFile = await findBackupFile(accessToken);

      if (backupFile) {
        addToast('Backup encontrado. Sincronizando...', 'info');
        const data = await downloadBackupFile(backupFile.id, accessToken);
        await restoreFromBackupData(data);
        await refreshAll();
        addToast('Dados sincronizados com sucesso!', 'success');
      } else {
        // Se não existe, cria o primeiro backup
        addToast('Conectado! Criando backup seguro...', 'info');
        await uploadBackupToAppData(accessToken);
      }
      setSyncStatus('success');
    } catch (e) {
      console.error('[Auth] Sync Error:', e);
      setSyncStatus('error');
      addToast('Erro na sincronização inicial.', 'error');
    }
  };

  const loginFlow = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        console.log('[Auth] Login Success:', tokenResponse);
        const accessToken = tokenResponse.access_token;
        setToken(accessToken);
        localStorage.setItem('google_access_token', accessToken);

        // 1. Get Profile
        await fetchProfile(accessToken);

        // 2. Sync Logic (Ao logar, tentamos sincronizar/baixar backup)
        await handleSyncInitial(accessToken);

      } catch (e) {
        console.error('[Auth] Login Flow Error:', e);
        addToast('Erro no processo de login.', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('[Auth] Google Login Failed:', errorResponse);
      addToast(`Falha na autenticação Google.`, 'error');
      setIsLoading(false);
    },
    scope: 'https://www.googleapis.com/auth/drive.appdata profile email',
  });

  const login = () => {
    loginFlow();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      // isLoading impacta UI de quem consome, mas não bloqueia a aplicação
      isLoading: isLoading || syncStatus === 'syncing',
      token,
      login,
      logout,
      syncStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};