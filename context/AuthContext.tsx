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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('google_access_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  const { addToast } = useToast();
  const { refreshAll } = useFinanceMutations();

  // Função auxiliar para obter perfil
  const fetchProfile = async (accessToken: string) => {
    try {
        const res = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`, {
            headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('Falha ao obter perfil');
        const profile = await res.json();
        setUser(profile);
        localStorage.setItem('user_profile', JSON.stringify(profile));
        return profile;
    } catch (e) {
        console.error(e);
        // Se falhar o perfil, o token provavelmente é inválido
        logout();
    }
  };

  // Restore session on mount
  useEffect(() => {
      const storedToken = localStorage.getItem('google_access_token');
      const storedUser = localStorage.getItem('user_profile');
      
      if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Opcional: Aqui poderíamos validar se o token expirou chamando um endpoint simples
      }
  }, []);

  const handleSyncInitial = async (accessToken: string) => {
      setSyncStatus('syncing');
      try {
          // 1. Procura backup na AppData (Pasta oculta)
          const backupFile = await findBackupFile(accessToken);
          
          if (backupFile) {
              addToast('Backup encontrado. Restaurando...', 'info');
              const data = await downloadBackupFile(backupFile.id, accessToken);
              await restoreFromBackupData(data);
              await refreshAll();
              addToast('Dados sincronizados com sucesso!', 'success');
          } else {
              // Se não existe, cria o primeiro backup
              addToast('Criando cofre seguro no Drive...', 'info');
              await uploadBackupToAppData(accessToken);
          }
          setSyncStatus('success');
      } catch (e) {
          console.error(e);
          setSyncStatus('error');
          addToast('Erro na sincronização inicial.', 'error');
      }
  };

  const loginFlow = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const accessToken = tokenResponse.access_token;
        setToken(accessToken);
        localStorage.setItem('google_access_token', accessToken);
        
        // 1. Get Profile
        await fetchProfile(accessToken);

        // 2. Sync Logic (Local-First Sync)
        await handleSyncInitial(accessToken);

      } catch (e) {
        addToast('Erro no login.', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      addToast('Falha na autenticação Google.', 'error');
      setIsLoading(false);
    },
    scope: 'https://www.googleapis.com/auth/drive.appdata profile email',
  });

  const login = () => {
      loginFlow();
  };

  const logout = () => {
      googleLogout();
      setToken(null);
      setUser(null);
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('user_profile');
      setSyncStatus('idle');
      addToast('Você saiu com sucesso.', 'info');
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthenticated: !!user, 
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