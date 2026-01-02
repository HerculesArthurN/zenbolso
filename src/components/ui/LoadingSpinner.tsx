import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    {/* Shadow/Glow effect */}
                    <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full scale-150 animate-pulse" />
                    <Loader2 className="w-12 h-12 text-teal-600 dark:text-teal-400 animate-spin relative z-10" />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    Zenizando...
                </p>
            </div>
        </div>
    );
};
