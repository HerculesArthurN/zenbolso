import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import {
    ArrowRight,
    Check,
    ShieldCheck,
    Zap,
    Clock,
    Smartphone,
    Flame,
    MousePointer2,
    Lock
} from 'lucide-react';

// --- Sub-components ---

const PricingCard = ({
    title,
    price,
    period,
    features,
    highlight = false,
    tag,
    onClick
}: {
    title: string,
    price: string,
    period: string,
    features: string[],
    highlight?: boolean,
    tag?: string,
    onClick: () => void
}) => (
    <div className={`
    relative flex flex-col p-8 rounded-[32px] border transition-all duration-500
    ${highlight
            ? 'bg-gradient-to-b from-violet-600/20 to-slate-900/40 border-violet-500/50 shadow-2xl shadow-violet-500/10 scale-105'
            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
  `}>
        {tag && (
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-violet-500 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                {tag}
            </span>
        )}

        <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-400 mb-2">{title}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{price}</span>
                <span className="text-slate-500 font-medium">/{period}</span>
            </div>
            {highlight && (
                <p className="text-violet-400 text-sm font-bold mt-2">Equivalente a R$ 9,99/mês</p>
            )}
        </div>

        <ul className="space-y-4 mb-10 flex-grow">
            {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="flex-shrink-0 w-5 h-5 bg-violet-500/10 text-violet-400 rounded-full flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                    </div>
                    {feature}
                </li>
            ))}
        </ul>

        <button
            onClick={onClick}
            className={`
        w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95
        ${highlight
                    ? 'bg-violet-600 hover:bg-violet-50 text-white hover:text-violet-900 shadow-xl shadow-violet-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'}
      `}
        >
            Assinar Agora
        </button>
    </div>
);

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    // We don't redirect immediately to allow them to see the landing page
    // but we can offer a button to skip if they've visited.
    // Or just keep the logic if it's important for UX. 
    // Given the task is to refactor for CONVERSION, maybe we should let them see it.
    /*
    useEffect(() => {
        if (user || hasVisited) {
            navigate('/dashboard');
        }
    }, [user, hasVisited, navigate]);
    */

    const handleStart = () => {
        localStorage.setItem('zenbolso_intro_seen', 'true');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 selection:text-violet-200 relative overflow-hidden">
            {/* Global Background Grid */}
            <div className="absolute inset-0 bg-grid-white pointer-events-none" />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 backdrop-blur-md bg-slate-950/50 border-b border-slate-900/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                        <BrandLogo variant="color" className="w-9 h-9 transition-transform group-hover:scale-110" />
                        <span className="text-2xl font-black tracking-tighter italic">
                            <span className="text-white">ZEN</span>
                            <span className="text-teal-500">BOLSO</span>
                        </span>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2 rounded-full border border-slate-800 text-slate-300 font-bold hover:bg-slate-900 transition-colors"
                    >
                        Login
                    </button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 px-6">
                {/* Glowing Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-slow delay-700" />
                </div>

                <div className="max-w-4xl mx-auto text-center space-y-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-black uppercase tracking-widest animate-bounce">
                        <Flame size={14} />
                        Finalmente: Controle Financeiro sem Preguiça
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[1.05]">
                        Pare de perder tempo <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-500">
                            controlando dinheiro.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Escreva como se estivesse no <span className="text-emerald-400 font-bold">WhatsApp</span>.
                        Nossa inteligência entende tudo instantaneamente.
                    </p>

                    <div className="flex flex-col items-center gap-6 pt-4">
                        <button
                            onClick={handleStart}
                            className="px-12 py-6 bg-violet-600 hover:bg-violet-500 text-white rounded-[32px] font-black text-xl shadow-2xl shadow-violet-600/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-4 group"
                        >
                            Começar Teste Grátis
                            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                        <p className="text-slate-500 text-sm flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            Garantia de 7 dias • Risco Zero
                        </p>
                    </div>
                </div>

                {/* Floating Elements Mockup Spacer */}
                <div className="mt-20 relative max-w-5xl mx-auto h-24 pointer-events-none opacity-50">
                    <div className="absolute top-0 right-10 flex flex-col items-center animate-bounce duration-[3s]">
                        <MousePointer2 className="text-violet-400 rotate-12" size={40} />
                        <span className="text-xs font-bold bg-slate-800 px-3 py-1 rounded-full text-white mt-2">Clique Zero</span>
                    </div>
                </div>
            </section>

            {/* MAGIC DEMO SECTION */}
            <section className="py-24 px-6 bg-slate-900/40 border-y border-slate-900">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 text-violet-400 font-black uppercase tracking-[0.2em] text-sm">
                                <Zap size={18} fill="currentColor" />
                                O Fim dos Formulários
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                A Barra Mágica que <br />
                                <span className="text-violet-500 italic">elimina 10 cliques.</span>
                            </h2>
                            <p className="text-lg text-slate-400 leading-relaxed">
                                Esqueça selecionar data, categoria, conta e valor.
                                Apenas digite e o sistema categoriza tudo em tempo real.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Categorização Automática",
                                    "Detecção de Meio de Pagamento",
                                    "Data Inteligente (ex: 'hoje', 'ontem')",
                                    "Velocidade Relâmpago"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-200 font-medium font-bold">
                                        <div className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Magic Input Visual Representation */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-violet-500/10 rounded-3xl blur-2xl group-hover:bg-violet-500/20 transition-all duration-700" />
                            <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-[40px] shadow-3xl overflow-hidden">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-slate-800" />
                                            <div className="w-3 h-3 rounded-full bg-slate-800" />
                                            <div className="w-3 h-3 rounded-full bg-slate-800" />
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Simulação de Entrada</div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-bold text-slate-500 italic">O que você digita:</div>
                                        <div className="bg-slate-900 text-white p-5 rounded-2xl border-2 border-violet-500/50 text-xl font-medium flex items-center gap-3">
                                            Pizza 45 Nubank
                                            <span className="w-1 h-6 bg-violet-500 animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="text-sm font-bold text-slate-500 italic">O que detectamos:</div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { label: "Valor", value: "R$ 45,00", color: "text-emerald-400" },
                                                { label: "Categoria", value: "Alimentação", color: "text-violet-400" },
                                                { label: "Conta", value: "Nubank", color: "text-sky-400" }
                                            ].map((tag, i) => (
                                                <div key={i} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1 items-center animate-in fade-in slide-in-from-bottom duration-500 delay-[500ms]">
                                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter">{tag.label}</span>
                                                    <span className={`text-sm font-black ${tag.color}`}>{tag.value}</span>
                                                    <div className="mt-1">
                                                        <Check size={12} className="text-emerald-500" strokeWidth={4} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating "WhatsApp Style" bubble */}
                            <div className="absolute -bottom-6 -right-6 bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 animate-pulse">
                                <Smartphone size={18} />
                                Igualzinho ao Chat
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ZEN INSIGHTS (Emotional Pain) */}
            <section className="py-24 px-6 relative">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <div className="inline-flex items-center gap-2 text-rose-500 font-black uppercase tracking-[0.2em] text-sm">
                        <Clock size={18} />
                        Tempo é Vida, não só dinheiro
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                        Você não gastou R$ 200. <br />
                        <span className="text-rose-500 uppercase italic underline decoration-wavy underline-offset-8 decoration-rose-500/30">
                            Você gastou 6 horas de trabalho.
                        </span>
                    </h2>

                    <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
                        O ZenBolso não te mostra apenas números. Ele te mostra o custo real das suas escolhas em
                        <strong> esforço e tempo de vida</strong>. Consciência gera liberdade.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
                        <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl text-left space-y-3">
                            <h4 className="text-rose-400 font-black flex items-center gap-2">
                                <Zap size={16} /> Sem ZenBolso
                            </h4>
                            <p className="text-slate-400 text-sm">Horas perdidas em planilhas, medo de abrir o banco e compras por impulso sem saber se o dinheiro vai dar até o fim do mês.</p>
                        </div>
                        <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl text-left space-y-3">
                            <h4 className="text-emerald-400 font-black flex items-center gap-2">
                                <Check size={16} /> Com ZenBolso
                            </h4>
                            <p className="text-slate-400 text-sm">Decisões rápidas, paz mental ao saber exatamente para onde o dinheiro flui e mais tempo para o que realmente importa.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRICING SECTION */}
            <section id="pricing" className="py-24 px-6 bg-slate-900/40 relative">
                <div className="max-w-5xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-white">Investimento na sua Paz</h2>
                        <p className="text-slate-400">Escolha o plano que melhor se adapta ao seu momento.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <PricingCard
                            title="Plano Mensal"
                            price="R$ 19,90"
                            period="mês"
                            features={[
                                "Smart Input Ilimitado",
                                "Sincronização na Nuvem",
                                "Dashboard Completo",
                                "Relatórios de Tempo x Valor",
                                "Cancelamento a qualquer momento"
                            ]}
                            onClick={handleStart}
                        />

                        <PricingCard
                            title="Plano Anual"
                            price="R$ 9,99"
                            period="mês"
                            highlight={true}
                            tag="Melhor Escolha (-50%)"
                            features={[
                                "Tudo do plano mensal",
                                "Economia de R$ 119 p/ ano",
                                "Prioridade em novas funções",
                                "Acesso Antecipado",
                                "Faturamento Anual de R$ 119,90"
                            ]}
                            onClick={handleStart}
                        />
                    </div>

                    {/* Security & Refund */}
                    <div className="flex flex-col items-center gap-6 pt-10">
                        <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-16">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-violet-400">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">Garantia Total de 7 Dias</h4>
                                    <p className="text-slate-500 text-xs">Não gostou? Devolvemos 100%.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-violet-400">
                                    <Lock size={28} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">Pagamento Seguro</h4>
                                    <p className="text-slate-500 text-xs">Criptografia de ponta a ponta.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[48px] p-12 md:p-20 shadow-2xl shadow-violet-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700" />

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                            Comece hoje a ter <br /> dominar seu dinheiro.
                        </h2>
                        <p className="text-violet-100 text-lg md:text-xl font-medium max-w-xl mx-auto">
                            Junte-se a centenas de pessoas que trocaram a ansiedade financeira pela paz do ZenBolso.
                        </p>
                        <button
                            onClick={handleStart}
                            className="px-12 py-6 bg-white text-violet-600 hover:bg-slate-100 rounded-[32px] font-black text-xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto"
                        >
                            Começar Teste Grátis
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-slate-900 border-opacity-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 grayscale group hover:grayscale-0 transition-all cursor-pointer" onClick={() => navigate('/')}>
                        <BrandLogo variant="color" className="w-6 h-6 opacity-80" />
                        <span className="text-sm font-black italic tracking-tighter">
                            <span className="text-slate-500">ZEN</span>
                            <span className="text-teal-600">BOLSO</span>
                        </span>
                    </div>

                    <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <a href="#" className="hover:text-violet-400 transition-colors">Termos</a>
                        <a href="#" className="hover:text-violet-400 transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-violet-400 transition-colors">Suporte</a>
                    </div>

                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">
                        © 2026 ZenBolso • Finanças Humanas
                    </p>
                </div>
            </footer>

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                .animate-bounce {
                    animation: bounce 3s infinite ease-in-out;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s infinite ease-in-out;
                }
                .animate-float {
                    animation: float 6s infinite ease-in-out;
                }
                .bg-grid-white {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.04)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
                }
            `}</style>
        </div>
    );
};
