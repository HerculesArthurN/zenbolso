import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, Shield, Sparkles, PieChart, TrendingUp, Wallet, CheckCircle2, Lock } from 'lucide-react';
import { SETUP_KEY } from '../constants';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        // 1. Inicializar "banco" (Simulando) e definindo flag de setup.
        // Como é local-first, apenas marcamos que o usuário passou pelo onboard.
        localStorage.setItem(SETUP_KEY, 'true');

        // 2. Navegar para o Dashboard imediatamente (sem login).
        // O Guard (RequireSetup) vai permitir o acesso agora.
        navigate('/dashboard');

        // Pequeno hack para garantir que estados baseados em localStorage no App.tsx recarreguem se necessário,
        // mas com o novo roteamento e Guards lendo direto do storage, deve funcionar.
        // Se precisar forçar render: navigate(0) ou window.location.reload() (evitar se possível).
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-900">

            {/* --- HERO SECTION --- */}
            <section className="relative pt-20 pb-32 px-6 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles size={12} />
                        Simplicidade Radical
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
                        Acalme o caos financeiro <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">
                            em 5 segundos por dia.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Sem gráficos complexos de banco. Sem enviar seus dados para a nuvem.
                        Apenas você, seu dinheiro e clareza total.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <Button
                            onClick={handleStart}
                            size="lg"
                            className="rounded-full px-8 py-6 text-lg shadow-xl shadow-teal-500/20 hover:scale-105 transition-transform"
                        >
                            Começar Agora (Grátis & Offline) <ArrowRight className="ml-2" />
                        </Button>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Shield size={12} /> Dados salvos apenas no dispositivo
                        </span>
                    </div>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40 dark:opacity-20">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                {/* Visual Mockup - CSS Only */}
                <div className="mt-16 mx-auto max-w-sm md:max-w-4xl relative z-10 animate-in fade-in zoom-in duration-1000 delay-300">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 md:p-4 rotate-1 hover:rotate-0 transition-transform duration-500">
                        {/* Fake App Interface Header */}
                        <div className="h-full bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 md:p-16 border border-slate-100 dark:border-slate-800">
                            <div className="text-center space-y-4">
                                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Saldo Disponível</p>
                                <p className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white">R$ 2.450,00</p>
                                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full w-fit mx-auto">
                                    <CheckCircle2 size={16} />
                                    <span className="text-sm font-bold">No controle</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- THE PROBLEM --- */}
            <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                        Por que você sente que o dinheiro some?
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-12">
                        Apps de banco são feitos para te vender crédito, não para te organizar.
                        Planilhas são poderosas, mas chatas e difíceis de manter no celular.
                        O resultado? <span className="font-semibold text-rose-500">Ansiedade e assinaturas fantasmas drenando sua conta.</span>
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Inflação de Estilo de Vida</h3>
                            <p className="text-sm text-slate-500">Ganhamos mais, gastamos mais e nem percebemos onde.</p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <PieChart size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Cegueira Financeira</h3>
                            <p className="text-sm text-slate-500">Misturar gastos fixos com lazer cria a ilusão de que sobra dinheiro.</p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Lock size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Medo de Expor Dados</h3>
                            <p className="text-sm text-slate-500">Receio de conectar contas bancárias em apps de terceiros.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- THE SOLUTION --- */}
            <section className="py-24 px-6 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Educação Financeira Expressa</h2>
                        <p className="text-slate-500">Um método simples de 3 passos integrado ao aplicativo.</p>
                    </div>

                    <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-3 md:gap-12 relative">
                        {/* Connector Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-teal-200 via-emerald-200 to-teal-200 dark:from-slate-800 dark:to-slate-800 -z-10"></div>

                        <div className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:-translate-y-1 transition-transform">
                            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-2xl flex items-center justify-center mb-6 text-xl font-bold shadow-sm">1</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Consciência (Input)</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Registre sem pensar. O <span className="font-semibold text-teal-600">Smart Input</span> entende "Café 10" e categoriza para você. Fricção zero na fila do mercado.
                            </p>
                        </div>

                        <div className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:-translate-y-1 transition-transform">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 text-xl font-bold shadow-sm">2</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Visão (Clareza)</h3>
                            <p className="text-slate-500 leading-relaxed">
                                O Dashboard limpo separa o essencial do supérfluo. Veja instantaneamente quanto do seu "Tempo de Vida" foi gasto.
                            </p>
                        </div>

                        <div className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:-translate-y-1 transition-transform">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center mb-6 text-xl font-bold shadow-sm">3</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Previsão (Futuro)</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Saiba hoje se vai faltar dinheiro no dia 30. Simule compras antes de fazê-las e evite o arrependimento.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRIVACY & TRUST --- */}
            <section className="py-20 px-6 bg-slate-900 text-white rounded-t-[3rem] -mt-10 relative z-20">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-teal-400 text-xs font-bold uppercase tracking-wider">
                            <Lock size={12} />
                            Privacidade Radical
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                            Seus dados moram <br />no seu bolso.
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Diferente de outros apps, <strong>não temos servidores</strong> para armazenar suas finanças.
                            Seu saldo fica gravado exclusivamente no seu navegador. Ninguém vê, ninguém vende, ninguém analisa.
                        </p>
                        <ul className="space-y-3 pt-2">
                            <li className="flex items-center gap-3 text-slate-300">
                                <CheckCircle2 className="text-teal-500" size={20} /> Funciona 100% Offline
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <CheckCircle2 className="text-teal-500" size={20} /> Backup manual via arquivo CSV
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="relative w-64 h-64 bg-slate-800 rounded-full flex items-center justify-center shadow-2xl shadow-teal-900/50 border border-slate-700">
                            <Shield size={100} className="text-teal-500 drop-shadow-glow animate-pulse" style={{ animationDuration: '3s' }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-slate-950 text-slate-500 py-12 px-6 text-center border-t border-slate-900">
                <div className="max-w-2xl mx-auto space-y-6">
                    <Wallet className="w-8 h-8 mx-auto text-teal-700" />
                    <p className="text-sm font-medium">
                        "Acreditamos que a liberdade financeira começa com o controle, não com a renda."
                    </p>
                    <div className="pt-8">
                        <Button onClick={handleStart} size="lg" className="w-full md:w-auto rounded-full">
                            Assumir o Controle Agora
                        </Button>
                    </div>
                    <p className="text-xs opacity-50 pt-8">
                        © {new Date().getFullYear()} Gerente Pessoal de Bolso. Local First Software.
                    </p>
                </div>
            </footer>
        </div>
    );
};