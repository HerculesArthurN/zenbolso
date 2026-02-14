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
    Lock,
    Globe,
    WifiOff,
    Sparkles,
    Star
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
    relative flex flex-col p-8 rounded-[32px] border transition-all duration-500 hover:-translate-y-2
    ${highlight
            ? 'bg-gradient-to-b from-violet-600/20 to-slate-900/40 border-violet-500/50 shadow-2xl shadow-violet-500/10 scale-105 z-10'
            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}
  `}>
        {tag && (
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap">
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
                <p className="text-violet-400 text-sm font-bold mt-2 bg-violet-500/10 inline-block px-3 py-1 rounded-lg">
                    Equivalente a R$ 9,99/mês
                </p>
            )}
        </div>

        <ul className="space-y-4 mb-10 flex-grow">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm font-medium">
                    <div className="flex-shrink-0 w-5 h-5 mt-0.5 bg-violet-500/10 text-violet-400 rounded-full flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                    </div>
                    {feature}
                </li>
            ))}
        </ul>

        <button
            onClick={onClick}
            className={`
        w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2 group
        ${highlight
                    ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-violet-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'}
      `}
        >
            Assinar Agora
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
    </div>
);

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        localStorage.setItem('zenbolso_intro_seen', 'true');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 selection:text-violet-200 relative overflow-hidden">
            {/* Global Background Grid */}
            <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-40" />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 backdrop-blur-xl bg-slate-950/70 border-b border-slate-900/80 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                        <BrandLogo variant="color" className="w-9 h-9 transition-transform group-hover:scale-110 drop-shadow-lg" />
                        <span className="text-2xl font-black tracking-tighter italic">
                            <span className="text-white">ZEN</span>
                            <span className="text-teal-500 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]">BOLSO</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:block text-slate-300 font-bold hover:text-white transition-colors"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={handleStart}
                            className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-black hover:bg-slate-100 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        >
                            Teste Grátis
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
                        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[100px] animate-pulse-slow delay-700" />
                    </div>

                    <div className="max-w-4xl mx-auto text-center space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-violet-500/30 text-violet-300 text-xs font-black uppercase tracking-widest backdrop-blur-sm animate-fade-in-up">
                            <Flame size={14} className="text-rose-500" />
                            A revolução Local-First chegou
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.05] animate-fade-in-up animation-delay-100">
                            Domine suas finanças com <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-500">
                                a paz de um sistema Zen.
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
                            Velocidade instantânea com processamento offline e criptografia de ponta. O controle financeiro que respeita seu tempo e sua privacidade.
                        </p>

                        <div className="flex flex-col items-center gap-4 pt-4 animate-fade-in-up animation-delay-300">
                            <button
                                onClick={handleStart}
                                className="px-10 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-[32px] font-black text-xl shadow-[0_0_40px_rgba(124,58,237,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] active:scale-95 flex items-center gap-4 group"
                            >
                                Começar Agora — É Grátis
                                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                            <p className="text-slate-500 text-sm font-medium">
                                Não exige cartão de crédito • Garantia de 7 dias
                            </p>
                        </div>

                        {/* Social Proof Mini */}
                        <div className="pt-8 flex flex-col items-center gap-3 animate-fade-in-up animation-delay-400">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=transparent`} alt="User avatar" className="w-8 h-8 opacity-80" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                                <div className="flex text-amber-400">
                                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill="currentColor" />)}
                                </div>
                                <span>Amado por usuários focados no essencial</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* THE "SUPERPOWERS" GRID (Tech Highlights) */}
                <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm hover:border-violet-500/30 transition-colors">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                                <WifiOff size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-3">Offline-First (PWA)</h3>
                            <p className="text-slate-400 leading-relaxed">Instale no celular e use mesmo sem internet. Seus dados são salvos localmente e sincronizam automaticamente quando a rede volta.</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm hover:border-violet-500/30 transition-colors">
                            <div className="w-12 h-12 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center mb-6">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-3">Segurança Nível Bancário</h3>
                            <p className="text-slate-400 leading-relaxed">Seus dados sensíveis são criptografados no próprio dispositivo (AES-256) antes de irem para a nuvem. Nem nós temos acesso.</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm hover:border-violet-500/30 transition-colors">
                            <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center mb-6">
                                <Globe size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-3">Múltiplas Moedas</h3>
                            <p className="text-slate-400 leading-relaxed">Suporte nativo a 8 idiomas e conversão inteligente de moedas. Perfeito para nômades digitais e quem vive uma vida global.</p>
                        </div>
                    </div>
                </section>

                {/* MAGIC DEMO SECTION */}
                <section className="py-24 px-6 bg-slate-900/30 border-y border-slate-800/50">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 text-violet-400 font-black uppercase tracking-[0.2em] text-sm">
                                    <Sparkles size={18} />
                                    Fricção Zero
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                    Input Inteligente que <br />
                                    <span className="text-violet-500 italic">entende o seu fluxo.</span>
                                </h2>
                                <p className="text-lg text-slate-400 leading-relaxed">
                                    Esqueça formulários complexos e menus infinitos. Nossa engine processa entradas em linguagem natural,
                                    categorizando valor, conta e descrição em milissegundos.
                                </p>

                                <ul className="space-y-5">
                                    {[
                                        "Escreva como se falasse no WhatsApp",
                                        "Categorização automática inteligente",
                                        "Design fluido sem tempo de carregamento"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-4 text-slate-200 font-bold">
                                            <div className="w-8 h-8 bg-violet-500/10 text-violet-400 rounded-xl flex items-center justify-center shrink-0">
                                                <Check size={16} strokeWidth={3} />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Magic Input Visual Representation */}
                            <div className="relative group perspective-1000">
                                <div className="absolute -inset-4 bg-violet-500/10 rounded-3xl blur-2xl group-hover:bg-violet-500/20 transition-all duration-700" />
                                <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-[40px] shadow-2xl overflow-hidden transform transition-all duration-500 group-hover:rotate-y-2 group-hover:-rotate-x-2">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-slate-800" />
                                                <div className="w-3 h-3 rounded-full bg-slate-800" />
                                                <div className="w-3 h-3 rounded-full bg-slate-800" />
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Smart Input Demo</div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm font-bold text-slate-500 italic">O que você digita:</div>
                                            <div className="bg-slate-900 text-white p-5 rounded-2xl border-2 border-violet-500/50 text-xl font-medium flex items-center justify-between">
                                                <span>Pizza 45 Nubank</span>
                                                <MousePointer2 className="text-violet-400 animate-pulse" size={20} />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            <div className="text-sm font-bold text-slate-500 italic">A mágica acontece:</div>
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
                                <div className="absolute -bottom-6 -right-6 bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 animate-bounce shadow-emerald-500/20 z-20">
                                    <Smartphone size={18} />
                                    Igualzinho ao WhatsApp!
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
                            A Realidade do Seu Tempo
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                            Seu dinheiro é tempo. <br />
                            <span className="text-rose-500 uppercase italic underline decoration-wavy underline-offset-8 decoration-rose-500/30">
                                Proteja o que é finito.
                            </span>
                        </h2>

                        <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
                            O ZenBolso transcende tabelas frias. Ele quantifica o custo real das suas escolhas em
                            <strong className="text-white"> esforço e horas de vida</strong>. Consciência é o primeiro passo para a liberdade financeira.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
                            <div className="p-10 bg-rose-500/5 border border-rose-500/10 rounded-[32px] text-left space-y-4 hover:bg-rose-500/10 transition-colors">
                                <h4 className="text-rose-400 font-black flex items-center gap-3 text-xl">
                                    <Zap size={20} /> Sem ZenBolso
                                </h4>
                                <p className="text-slate-400 leading-relaxed">Horas perdidas tentando fechar planilhas, medo de abrir o aplicativo do banco e compras por impulso sem noção do impacto no seu mês.</p>
                            </div>
                            <div className="p-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] text-left space-y-4 hover:bg-emerald-500/10 transition-colors">
                                <h4 className="text-emerald-400 font-black flex items-center gap-3 text-xl">
                                    <ShieldCheck size={20} /> Com ZenBolso
                                </h4>
                                <p className="text-slate-400 leading-relaxed">Decisões ultra rápidas, paz mental absoluta ao saber o destino de cada centavo, e mais tempo livre para curtir a vida de verdade.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRICING SECTION */}
                <section id="pricing" className="py-24 px-6 bg-slate-900/30 relative border-t border-slate-800/50">
                    <div className="max-w-5xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black text-white">Investimento na sua Paz</h2>
                            <p className="text-slate-400 text-lg">Escolha o plano que melhor se adapta ao seu momento de vida.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto relative">
                            {/* Background glow for pricing */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

                            <PricingCard
                                title="Plano Mensal"
                                price="R$ 19,90"
                                period="mês"
                                features={[
                                    "Lançamentos Inteligentes Ilimitados",
                                    "Funcionamento Offline-First (PWA)",
                                    "Sincronização em Nuvem",
                                    "Zen Insights (Custo em Tempo)",
                                    "Criptografia Client-Side (AES-256)"
                                ]}
                                onClick={handleStart}
                            />

                            <PricingCard
                                title="Plano Anual"
                                price="R$ 9,99"
                                period="mês"
                                highlight={true}
                                tag="Mais Popular (50% OFF)"
                                features={[
                                    "Todas as features do plano mensal",
                                    "Múltiplas Moedas (USD, EUR, etc)",
                                    "Faturamento Anual de R$ 119,88",
                                    "Acesso Antecipado a Novidades",
                                    "Suporte Prioritário Direto"
                                ]}
                                onClick={handleStart}
                            />
                        </div>

                        {/* Security & Refund */}
                        <div className="flex flex-col items-center gap-6 pt-10">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16 w-full">
                                <div className="flex items-center gap-4 bg-slate-900/50 py-4 px-6 rounded-2xl border border-slate-800">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-white font-bold text-sm">Garantia Incondicional</h4>
                                        <p className="text-slate-500 text-xs">7 dias. Não amou? 100% de volta.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-900/50 py-4 px-6 rounded-2xl border border-slate-800">
                                    <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400">
                                        <Lock size={28} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-white font-bold text-sm">Privacidade Absoluta</h4>
                                        <p className="text-slate-500 text-xs">Sem venda de dados. Zero ads.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CALL TO ACTION */}
                <section className="py-24 px-6 text-center">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 rounded-[48px] p-12 md:p-20 shadow-2xl shadow-violet-500/20 relative overflow-hidden group border border-white/10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full -ml-40 -mb-40 blur-3xl" />

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                                Retome o controle total <br /> da sua vida financeira.
                            </h2>
                            <p className="text-violet-100 text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-90">
                                Leva menos de 30 segundos para configurar. Junte-se a centenas de pessoas que trocaram o estresse das planilhas pela paz do ZenBolso.
                            </p>
                            <button
                                onClick={handleStart}
                                className="px-12 py-6 bg-white text-violet-900 hover:bg-slate-50 rounded-[32px] font-black text-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto"
                            >
                                Criar Conta Gratuita
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-900 bg-slate-950">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-pointer opacity-80 hover:opacity-100" onClick={() => navigate('/')}>
                        <BrandLogo variant="color" className="w-6 h-6" />
                        <span className="text-sm font-black italic tracking-tighter">
                            <span className="text-slate-400">ZEN</span>
                            <span className="text-teal-600">BOLSO</span>
                        </span>
                    </div>

                    <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <a href="#" className="hover:text-violet-400 transition-colors">Termos</a>
                        <a href="#" className="hover:text-violet-400 transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-violet-400 transition-colors">Login</a>
                    </div>

                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] md:text-right">
                        © 2026 ZenBolso • Built by Hercules Nardelli <br className="hidden md:block" />
                        Offline-First Financial Engineering
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
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-bounce {
                    animation: bounce 3s infinite ease-in-out;
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
                .animation-delay-400 { animation-delay: 400ms; }
                .bg-grid-white {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.04)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
};
