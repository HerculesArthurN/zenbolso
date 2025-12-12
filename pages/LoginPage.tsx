import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Shield, Cloud, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-glow border border-slate-100 dark:border-slate-800 p-8 md:p-10 relative z-10 transition-all">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/30">
                <Wallet className="text-white" size={32} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Sincronize sua Prosperidade
            </h1>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Entre para ativar o backup automático e seguro. Seus dados continuam privados, guardados no seu Google Drive.
            </p>
        </div>

        {/* Feature List */}
        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <Cloud className="text-teal-500 flex-shrink-0" size={18} />
                <span>Backup automático na nuvem</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <Shield className="text-teal-500 flex-shrink-0" size={18} />
                <span>Criptografia ponta-a-ponta (Drive)</span>
            </div>
        </div>

        {/* Action */}
        <div className="space-y-4">
            <Button 
                onClick={() => login()} 
                disabled={isLoading}
                className="w-full py-4 text-base font-semibold rounded-xl flex items-center justify-center gap-3 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin text-teal-600" size={20} />
                        <span className="text-slate-500">Preparando seu cofre...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continuar com Google</span>
                    </>
                )}
            </Button>
            
            {!isLoading && (
                <div className="text-center">
                    <button onClick={() => window.location.href = '/dashboard'} className="text-xs text-slate-400 hover:text-teal-600 transition-colors flex items-center justify-center gap-1 mx-auto">
                        Continuar sem login (Modo Offline) <ArrowRight size={10} />
                    </button>
                </div>
            )}
        </div>

      </div>
      
      <p className="mt-8 text-xs text-slate-400 text-center max-w-xs">
          Ao continuar, você concorda que seus dados serão armazenados na pasta oculta do aplicativo em seu Google Drive pessoal.
      </p>
    </div>
  );
};