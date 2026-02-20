import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import {
    ArrowRight,
    ShieldCheck,
    WifiOff,
    Zap
} from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { completeOnboarding } = useSession();

    const handleStart = () => {
        completeOnboarding();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 selection:text-violet-200 relative overflow-hidden">
            {/* Global Background Grid */}
            <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-40" />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 backdrop-blur-xl bg-slate-950/70 border-b border-slate-900/80 shadow-sm">
                <div className="max-w-[430px] mx-auto md:max-w-7xl flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                        <BrandLogo variant="color" className="w-9 h-9 transition-transform group-hover:scale-110 drop-shadow-lg" />
                        <span className="text-2xl font-black tracking-tighter italic">
                            <span className="text-white">ZEN</span>
                            <span className="text-emerald-500 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]">BOLSO</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleStart}
                            className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-black hover:bg-slate-100 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        >
                            Entrar
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                {/* HERO SECTION */}
                <section className="relative pt-40 pb-20 px-6">
                    {/* Glowing Background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse-slow delay-700" />
                    </div>

                    <div className="max-w-[430px] mx-auto md:max-w-4xl text-center space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-widest backdrop-blur-sm animate-fade-in-up">
                            <WifiOff size={14} className="text-emerald-500" />
                            100% Offline e Seguro
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.05] animate-fade-in-up animation-delay-100">
                            Organize sua vida <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500">
                                sem vender seus dados.
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
                            Seus dados financeiros ficam no seu aparelho. Sem nuvem, sem mensalidade, sem rastreamento.
                        </p>

                        <div className="flex flex-col items-center gap-4 pt-4 animate-fade-in-up animation-delay-300">
                            <button
                                onClick={handleStart}
                                className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-[32px] font-black text-xl shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4 group"
                            >
                                Começar Agora (Grátis)
                                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                            <p className="text-slate-500 text-sm font-medium">
                                Instalação Instantânea (PWA)
                            </p>
                        </div>
                    </div>
                </section>

                {/* THE "SUPERPOWERS" GRID */}
                <section className="py-20 px-6 max-w-[430px] md:max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                                <WifiOff size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-3">Offline-First</h3>
                            <p className="text-slate-400 leading-relaxed">Funciona 100% sem internet. Seus dados são salvos no seu navegador.</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
                            <div className="w-12 h-12 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-3">Privacidade Total</h3>
                            <p className="text-slate-400 leading-relaxed">Seus dados nunca saem do seu dispositivo. Ninguém além de você tem acesso.</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
                            <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center mb-6">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-3">Ultra Rápido</h3>
                            <p className="text-slate-400 leading-relaxed">Sem "loading". Tudo acontece instantaneamente porque roda localmente.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-900 bg-slate-950">
                <div className="max-w-[430px] md:max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2" onClick={() => navigate('/')}>
                        <BrandLogo variant="color" className="w-6 h-6" />
                        <span className="text-sm font-black italic tracking-tighter">
                            <span className="text-slate-400">ZEN</span>
                            <span className="text-emerald-600">BOLSO</span>
                        </span>
                    </div>

                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] md:text-right">
                        © 2026 ZenBolso • Offline-First Financial Engineering
                    </p>
                </div>
            </footer>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s infinite ease-in-out;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                    opacity: 0;
                }
                .animation-delay-100 { animation-delay: 100ms; }
                .animation-delay-200 { animation-delay: 200ms; }
                .animation-delay-300 { animation-delay: 300ms; }
                .bg-grid-white {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.04)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
                }
            `}</style>
        </div>
    );
};
