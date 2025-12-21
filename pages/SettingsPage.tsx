import React from 'react';
import { SettingsModal } from '../components/settings/SettingsModal';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext'; // Import Auth
import { Moon, Sun, Cloud, CloudOff, LogOut, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const { refreshData } = useData();
  const { login, logout, isAuthenticated, user, isLoading, syncStatus } = useAuth();

  // Theme Toggle Logic
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações</h1>
          <p className="text-slate-500 text-sm">Personalize sua experiência.</p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Sincronização / Backup */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
            <Cloud size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Backup & Sincronização</h2>
            <p className="text-sm text-slate-500">Mantenha seus dados seguros no Google Drive.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            {isAuthenticated ? (
              <img src={user?.picture} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                <CloudOff size={20} />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {isAuthenticated ? `Conectado como ${user?.name}` : 'Backup Desativado'}
              </p>
              <p className="text-xs text-slate-500">
                {isAuthenticated ? 'Seus dados estão sendo sincronizados.' : 'Conecte-se para evitar perda de dados.'}
                {syncStatus === 'syncing' && <span className="ml-2 text-blue-500 animate-pulse">Sincronizando...</span>}
              </p>
            </div>
          </div>

          <Button
            onClick={isAuthenticated ? logout : login}
            variant={isAuthenticated ? 'secondary' : 'primary'}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <><Loader2 className="animate-spin mr-2" size={16} /> Processando...</>
            ) : isAuthenticated ? (
              <><LogOut className="mr-2" size={16} /> Desconectar</>
            ) : (
              <><Cloud className="mr-2" size={16} /> Conectar Drive</>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        {/* Reuse Settings Logic */}
        <SettingsModal onDataUpdate={refreshData} />
      </div>
    </div>
  );
};