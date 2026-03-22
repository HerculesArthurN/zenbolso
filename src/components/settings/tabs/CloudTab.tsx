import React from 'react';
import { Cloud, User, LogOut } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useNavigate } from 'react-router-dom';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface CloudTabProps {
  isAuthenticated: boolean;
  user: SupabaseUser | null;
  onSignOut: () => void;
}

export const CloudTab: React.FC<CloudTabProps> = ({ isAuthenticated, user, onSignOut }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl flex gap-3 text-indigo-800 dark:text-indigo-300">
        <Cloud size={20} className="flex-shrink-0" />
        <div>
          <p className="text-sm font-bold mb-1">Backup Automático no Supabase</p>
          <p className="text-xs opacity-90">Seus dados são salvos de forma segura na nuvem.</p>
        </div>
      </div>

      {isAuthenticated && user ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-600"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <User size={24} />
              </div>
            )}
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-400">Conectado</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={onSignOut}
              variant="secondary"
              className="w-full gap-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            >
              <LogOut size={16} /> Desconectar Conta
            </Button>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              Ao desconectar, o backup automático será pausado.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto text-gray-400">
            <Cloud size={32} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Não conectado</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Conecte sua conta para habilitar o cofre seguro e backup automático.
            </p>
          </div>
          <Button onClick={() => navigate('/login')} className="gap-2">
            <User size={18} /> Entrar com E-mail
          </Button>
        </div>
      )}
    </div>
  );
};
