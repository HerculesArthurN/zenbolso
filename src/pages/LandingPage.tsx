import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrandLogo } from '../components/ui/BrandLogo';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export const LandingPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hasVisited, setHasVisited] = useState(!!localStorage.getItem('zenbolso_intro_seen'));

    useEffect(() => {
        if (user || hasVisited) {
            navigate('/dashboard');
        }
    }, [user, hasVisited, navigate]);

    const handleEnterAsGuest = () => {
        localStorage.setItem('zenbolso_intro_seen', 'true');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-background dark:bg-background-dark text-text-main dark:text-text-main-dark flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full -z-10 opacity-20 dark:opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary rounded-full blur-[120px] animate-blob" />
                <div className="absolute top-1/3 right-0 w-64 h-64 bg-secondary rounded-full blur-[120px] animate-blob animation-delay-2000" />
            </div>

            <main className="max-w-3xl w-full flex flex-col items-center gap-12 animate-in fade-in zoom-in duration-1000">
                {/* Logo with Breathing Animation */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-1000" />
                    <BrandLogo
                        variant="color"
                        className="w-32 h-32 md:w-40 md:h-40 animate-[pulse_4s_easeInOut_infinite] drop-shadow-2xl"
                    />
                </div>

                {/* Hero Text */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
                        Sua vida financeira, <br />
                        <span className="text-primary italic">finalmente em paz.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-text-muted dark:text-text-muted-dark max-w-xl mx-auto font-medium">
                        Sem planilhas complexas. <br className="md:hidden" />
                        Controle tudo com a simplicidade de uma frase.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                        onClick={handleEnterAsGuest}
                        className="px-10 py-5 bg-primary hover:bg-primary-hover text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        Entrar como Visitante
                        <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-700 dark:text-white rounded-[24px] font-bold text-lg border border-border-color dark:border-border-color-dark shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        Já tenho conta
                    </button>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
                    <div className="flex flex-col gap-3 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-border-color dark:border-border-color-dark transition-transform hover:-translate-y-1">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                            <Zap size={20} />
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800 dark:text-white">Smart Input</h3>
                        <p className="text-xs text-text-muted leading-relaxed">Escreva como você fala e deixe o ZenBolso processar o resto.</p>
                    </div>

                    <div className="flex flex-col gap-3 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-border-color dark:border-border-color-dark transition-transform hover:-translate-y-1">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800 dark:text-white">Privacidade</h3>
                        <p className="text-xs text-text-muted leading-relaxed">Dados salvos localmente. Você tem controle total das suas informações.</p>
                    </div>

                    <div className="flex flex-col gap-3 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-border-color dark:border-border-color-dark transition-transform hover:-translate-y-1">
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800 dark:text-white">Visual Zen</h3>
                        <p className="text-xs text-text-muted leading-relaxed">Interface limpa e intuitiva para você focar no que importa.</p>
                    </div>
                </div>
            </main>

            <footer className="mt-20 py-8 border-t border-border-color dark:border-border-color-dark w-full max-w-lg opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">ZenBolso • Finanças Humanas</p>
            </footer>

            <style>{`
                @keyframes pulse_4s_easeInOut_infinite {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                }
            `}</style>
        </div>
    );
};
