import React from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ErrorPage: React.FC = () => {
  const title = "Ops! Algo deu errado";
  const errorMessage = "Ocorreu um erro inesperado.";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl"></div>
        
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm relative z-10">
          <AlertTriangle size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">{title}</h1>
        <p className="text-slate-500 mb-8 leading-relaxed relative z-10">
          {errorMessage}
        </p>

        <div className="flex flex-col gap-3 relative z-10">
          <a href="/" className="w-full">
            <Button className="w-full gap-2 py-3 justify-center text-base" size="lg">
              <Home size={20} /> Voltar ao Início
            </Button>
          </a>
          
          <Button 
            variant="ghost" 
            onClick={() => window.location.reload()}
            className="w-full gap-2 justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <RotateCcw size={16} /> Tentar recarregar
          </Button>
        </div>
      </div>
    </div>
  );
};