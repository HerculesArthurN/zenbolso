import React, { useState, useEffect } from 'react';
import { accountService } from '../../services/accountService';
import { Modal } from '../../../components/ui/Modal';
import { BrandLogo } from '../ui/BrandLogo';
import { Sparkles, Wallet, ArrowRight, CheckCircle2, Wand2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

interface OnboardingWizardProps {
    onFinish: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onFinish }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [typewriterText, setTypewriterText] = useState('');
    const { addToast } = useToast();

    const fullDemoText = "Café 10 hoje";

    useEffect(() => {
        if (step === 2) {
            let i = 0;
            const timer = setInterval(() => {
                if (i <= fullDemoText.length) {
                    setTypewriterText(fullDemoText.slice(0, i));
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, 100);
            return () => clearInterval(timer);
        }
    }, [step]);

    const handleCreateAccount = async () => {
        if (!name.trim()) return;
        setIsLoading(true);
        try {
            await accountService.createAccount({
                name: name.trim(),
                balance: Number(balance) || 0,
                color: '#0D9488',
                type: 'WALLET'
            });
            setStep(2);
        } catch (err) {
            addToast('Erro ao criar conta inicial.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={() => { }} // Bloquear fechamento
            title=""
        >
            <div className="py-6 px-2 text-center space-y-8 animate-in fade-in zoom-in duration-500">

                {/* Step 1: A Carteira */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-[32px] animate-bounce">
                                <Wallet size={40} className="text-primary" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Primeiro, sua conta!</h2>
                            <p className="text-sm text-text-muted">Como você quer chamar sua carteira principal?</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex: Carteira, Nubank, Cofre..."
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary transition-all font-bold text-center"
                                autoFocus
                            />
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                                <input
                                    type="number"
                                    value={balance}
                                    onChange={e => setBalance(e.target.value)}
                                    placeholder="Saldo inicial (opcional)"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary transition-all font-bold text-center"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleCreateAccount}
                            disabled={!name || isLoading}
                            className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Criar e Continuar
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {/* Step 2: A Mágica do Input */}
                {step === 2 && (
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-[32px]">
                                <Wand2 size={40} className="text-secondary" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">O Toque de Mágica</h2>
                            <p className="text-sm text-text-muted">No ZenBolso, você não preenche formulários chatos. <br /> Basta escrever:</p>
                        </div>

                        <div className="p-6 bg-slate-900 rounded-3xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                            <div className="flex items-center gap-3 text-white/40 mb-3">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                            <p className="text-xl font-mono font-bold text-indigo-400 text-left">
                                {typewriterText}
                                <span className="w-2 h-6 bg-indigo-400 inline-block align-middle ml-1 animate-pulse" />
                            </p>

                            {typewriterText === fullDemoText && (
                                <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 animate-in slide-in-from-top-2">
                                    <p className="text-[10px] text-white/60 uppercase font-black tracking-widest text-left">O sistema entende:</p>
                                    <div className="flex gap-4 mt-1">
                                        <span className="text-xs text-rose-400 font-bold">Despesa: R$ 10,00</span>
                                        <span className="text-xs text-indigo-300 font-bold">Cat: Alimentação</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setStep(3)}
                            className="w-full py-5 bg-secondary text-white rounded-[24px] font-black shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Entendi, vamos lá!
                            <Sparkles size={20} />
                        </button>
                    </div>
                )}

                {/* Step 3: Celebração */}
                {step === 3 && (
                    <div className="space-y-8 py-4">
                        <div className="flex justify-center">
                            <BrandLogo variant="color" className="w-32 h-32 animate-bounce" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Tudo Pronto!</h2>
                            <p className="text-sm text-text-muted px-4">Sua jornada para uma vida financeira zen começa agora. <br /> Aproveite a paz de espírito.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-left">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                <CheckCircle2 size={16} className="text-emerald-600 mb-1" />
                                <p className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400">Conta Criada</p>
                            </div>
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                <CheckCircle2 size={16} className="text-indigo-600 mb-1" />
                                <p className="text-[10px] font-black uppercase text-indigo-800 dark:text-indigo-400">Smart Input OK</p>
                            </div>
                        </div>

                        <button
                            onClick={onFinish}
                            className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black shadow-2xl hover:bg-black transition-all"
                        >
                            Começar Experiência
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};
