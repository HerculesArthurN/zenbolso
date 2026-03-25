import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

// Contrato Estrito: O TypeScript não conhece esse evento por padrão.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Impede o Chrome de mostrar aquele aviso feio nativo na barra de URL
      e.preventDefault();
      // Salva o evento para dispararmos no clique do botão
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-2xl flex items-center justify-between z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
          <Download size={20} />
        </div>
        <div>
          <h3 className="text-slate-200 font-semibold text-sm">Instalar Zenbolso</h3>
          <p className="text-slate-400 text-xs">Acesso rápido e offline</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={handleInstallClick}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Instalar
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
