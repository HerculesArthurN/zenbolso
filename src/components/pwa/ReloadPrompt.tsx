import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';

export const ReloadPrompt: React.FC = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl shadow-2xl flex flex-col gap-4 min-w-[300px] backdrop-blur-xl bg-opacity-90">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                            <RefreshCw className={`w-5 h-5 text-indigo-400 ${needRefresh ? 'animate-spin-slow' : ''}`} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">
                                {offlineReady ? 'App pronto para uso offline!' : 'Nova versão disponível!'}
                            </h4>
                            <p className="text-slate-400 text-xs mt-0.5">
                                {needRefresh
                                    ? 'Atualize para obter as funcionalidades mais recentes.'
                                    : 'O ZenBolso está pronto para trabalhar sem internet.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {needRefresh && (
                        <button
                            onClick={() => updateServiceWorker(true)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Atualizar Agora
                        </button>
                    )}
                    <button
                        onClick={close}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
