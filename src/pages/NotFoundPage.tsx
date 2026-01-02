import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
            <div className="max-w-md w-full space-y-8">
                <div className="relative">
                    <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-[40px] flex items-center justify-center mx-auto shadow-inner relative z-10">
                        <Search size={56} />
                    </div>
                    {/* Shadow/Glow effect */}
                    <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150 -z-0" />
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Página não encontrada
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Parece que você navegou para muito longe do seu equilíbrio financeiro. Este caminho não leva a lugar algum.
                    </p>
                </div>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95 mx-auto"
                >
                    <ArrowLeft size={20} />
                    Voltar ao Início
                </Link>
            </div>
        </div>
    );
};
