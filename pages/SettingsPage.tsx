import React from 'react';
import { SettingsModal } from '../components/settings/SettingsModal';
import { useData } from '../context/DataContext';
import { Moon, Sun } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { refreshData } = useData();
  
  // Theme Toggle Logic (duplicated from App.tsx originally, but good to have here explicitly)
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

      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          {/* We reuse the logic from SettingsModal but render it inline */}
          <SettingsModal onDataUpdate={refreshData} />
      </div>
    </div>
  );
};