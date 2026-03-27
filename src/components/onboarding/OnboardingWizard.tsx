
import { ShieldCheck, Zap, Database } from 'lucide-react';
import { useOnboarding } from '../../hooks/useOnboarding';

export function OnboardingWizard() {
  const { showOnboarding, isLoading, isInjecting, completeOnboarding, generateSeedDataAndComplete } = useOnboarding();

  if (isLoading || !showOnboarding) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-emerald-500/10 rounded-[20px] flex items-center justify-center text-emerald-500 mb-6 shadow-xl shadow-emerald-500/20">
        <ShieldCheck size={32} />
      </div>
      
      <h1 className="text-2xl font-bold text-zinc-100 mb-3 uppercase tracking-widest">Bem-vindo ao Zenbolso</h1>
      <p className="text-zinc-400 mb-8 max-w-[280px] font-medium leading-relaxed">
        O seu gestor financeiro de bolso. <strong className="text-indigo-400">Zero Nuvem</strong>. <strong className="text-emerald-400">100% Privado</strong>. Seus dados nunca saem deste aparelho.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-[320px]">
        <button 
          onClick={generateSeedDataAndComplete}
          disabled={isInjecting}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white py-4 px-4 rounded-[20px] font-bold tracking-widest uppercase text-xs transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-emerald-500/30"
        >
          {isInjecting ? (
            <span className="animate-pulse">Gerando Dados...</span>
          ) : (
            <>
              <Zap size={18} />
              Testar com Dados Falsos
            </>
          )}
        </button>

        <button 
          onClick={completeOnboarding}
          disabled={isInjecting}
          className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 py-4 px-4 rounded-[20px] font-bold tracking-widest uppercase text-xs transition-all disabled:opacity-50 border border-zinc-700"
        >
          <Database size={18} />
          Começar do Zero
        </button>
      </div>
    </div>
  );
}