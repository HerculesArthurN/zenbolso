import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import {
    Database,
    Lock,
    Zap,
    Code,
    Smartphone,
    Github
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
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-hidden">
            {/* Global Background Grid with Radial Fade */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                        <BrandLogo variant="color" className="w-8 h-8" />
                        <span className="text-xl font-black tracking-tighter italic">
                            <span className="text-white">ZEN</span>
                            <span className="text-emerald-500">BOLSO</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/HerculesArthurN/zenbolso"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            <Github size={18} />
                            <span>Source</span>
                        </a>
                        <button
                            onClick={handleStart}
                            className="px-5 py-2 rounded-full bg-white text-slate-950 font-bold hover:bg-emerald-400 transition-all active:scale-95 text-sm"
                        >
                            Live Demo
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">

                {/* HERO SECTION */}
                <section className="max-w-5xl mx-auto text-center relative mb-32">
                    {/* Background Glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-mono mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        v1.0.0 • Local-First Architecture
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight animate-fade-in-up animation-delay-100">
                        Engenharia Financeira <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400">
                            Running on Localhost.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
                        Um estudo de caso em arquitetura <strong>Offline-First</strong>.
                        Dados criptografados no dispositivo, zero latência e sincronização manual via JSON.
                        Construído com React, Dexie.js e Tailwind.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
                        <button
                            onClick={handleStart}
                            className="w-full md:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                        >
                            <Zap size={20} className="fill-current" />
                            Inicializar App
                        </button>
                        <a
                            href="#"
                            className="w-full md:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Code size={20} />
                            Ler Documentação
                        </a>
                    </div>
                </section>

                {/* TECH STACK VISUALIZER */}
                <section className="max-w-4xl mx-auto mb-32 animate-fade-in-up animation-delay-300">
                    <div className="p-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-8"></div>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder for Logos - Replacing with Text/Icons for simplicity in this artifact */}
                        <div className="flex items-center gap-2 text-slate-300 font-bold"><Database size={20} /> Dexie.js</div>
                        <div className="flex items-center gap-2 text-sky-400 font-bold"><Code size={20} /> React 18</div>
                        <div className="flex items-center gap-2 text-blue-400 font-bold"><Code size={20} /> TypeScript</div>
                        <div className="flex items-center gap-2 text-cyan-400 font-bold"><Zap size={20} /> Vite</div>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold"><Lock size={20} /> Web Crypto API</div>
                    </div>
                </section>

                {/* ARCHITECTURE GRID */}
                <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
                    <Card
                        icon={<Database className="text-emerald-400" size={32} />}
                        title="IndexedDB & Dexie.js"
                        description="Persistência de dados ultra-rápida diretamente no navegador do usuário. Consultas complexas sem latência de rede."
                        code="db.transactions.where('date').above(lastMonth).toArray();"
                    />
                    <Card
                        icon={<Lock className="text-emerald-400" size={32} />}
                        title="Client-Side Privacy"
                        description="Seus dados financeiros nunca tocam nossos servidores. Arquitetura Designed for Privacy por padrão."
                        code="const key = window.crypto.subtle.generateKey(...);"
                    />
                    <Card
                        icon={<Smartphone className="text-emerald-400" size={32} />}
                        title="PWA & Offline Ready"
                        description="Instalável como nativo. Service Workers garantem funcionalidade total mesmo em modo avião."
                        code="registerSW({ onOfflineReady() { toast('Ready!'); } });"
                    />
                </section>

                {/* FEATURE DEEP DIVE */}
                <section className="max-w-7xl mx-auto mb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                                Data Sovereignty
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                                Seus dados. <br />
                                Seus formatos.
                            </h2>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                Acreditamos que você deve ser dono dos seus dados. Implementamos exportação completa em JSON para backup e CSV para interoperabilidade com Excel/Sheets.
                            </p>
                            <ul className="space-y-4">
                                <FeatureItem text="Streaming de JSON para grandes datasets" />
                                <FeatureItem text="Geração de PDF no Client-Side (@react-pdf)" />
                                <FeatureItem text="Validação de Schema com Zod" />
                            </ul>
                        </div>
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                            <div className="absolute inset-0 bg-grid-white/[0.05]" />
                            <div className="relative font-mono text-sm text-slate-300">
                                <div className="text-slate-500 mb-2">// Exemplo de Exportação</div>
                                <div className="text-purple-400">const</div> <div className="text-blue-400 inline">exportData</div> = <div className="text-yellow-300 inline">async</div> () ={'>'} {'{'}
                                <div className="pl-4">
                                    <div className="text-purple-400">const</div> txs = <div className="text-purple-400">await</div> db.transactions.toArray();
                                </div>
                                <div className="pl-4">
                                    <div className="text-purple-400">const</div> blob = <div className="text-yellow-300">new</div> <div className="text-emerald-400">Blob</div>([<div className="text-emerald-400">JSON</div>.stringify(txs)], {'{'}
                                    <div className="pl-4">type: <span className="text-orange-400">'application/json'</span></div>
                                    {'}'});
                                </div>
                                <div className="pl-4">
                                    saveAs(blob, <span className="text-orange-400">'backup-zenbolso.json'</span>);
                                </div>
                                {'}'}
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6 text-center">
                <p className="text-slate-500 text-sm">
                    Built with <span className="text-red-500">♥</span> by Hercules within the Vibe ecosystem.
                </p>
            </footer>

            <style>{`
                .bg-grid-white {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.04)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                    opacity: 0;
                    transform: translateY(20px);
                }
                @keyframes fade-in-up {
                    to { opacity: 1; transform: translateY(0); }
                }
                .animation-delay-100 { animation-delay: 100ms; }
                .animation-delay-200 { animation-delay: 200ms; }
                .animation-delay-300 { animation-delay: 300ms; }
            `}</style>
        </div>
    );
};

const Card: React.FC<{ icon: React.ReactNode, title: string, description: string, code: string }> = ({ icon, title, description, code }) => (
    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:bg-slate-900/80 transition-all hover:-translate-y-1 hover:border-emerald-500/30 group">
        <div className="mb-6 bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3 font-mono">{title}</h3>
        <p className="text-slate-400 leading-relaxed mb-6 text-sm">{description}</p>
        <div className="bg-black/50 rounded-lg p-3 font-mono text-xs text-emerald-300/80 border border-white/5 truncate">
            {code}
        </div>
    </div>
);

const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
    <li className="flex items-center gap-3 text-slate-300">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {text}
    </li>
);
