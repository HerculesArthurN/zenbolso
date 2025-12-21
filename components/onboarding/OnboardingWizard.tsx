import React, { useState } from 'react';

import { Button } from '../ui/Button';
import { ArrowRight, Check, Wallet, Home, ShoppingCart, Sparkles } from 'lucide-react';
import { postTransaction, postRecurringConfig, updateSettings } from '../../services/api';
import { RecurringConfig } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../../context/ToastContext';
import { generateRRule } from '../../services/recurrence';

interface OnboardingWizardProps {
    isOpen: boolean;
    onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onComplete }) => {
    const { addToast } = useToast();
    const [step, setStep] = useState(1);
    const [income, setIncome] = useState('');
    const [rent, setRent] = useState('');
    const [groceries, setGroceries] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = () => setStep(step + 1);

    const handleFinish = async () => {
        setLoading(true);
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const rruleMonthly = generateRRule('monthly', localDate);

        try {
            // 1. Income (Recurring)
            if (income) {
                const val = parseFloat(income);
                if (!isNaN(val) && val > 0) {
                    const config: RecurringConfig = {
                        id: uuidv4(),
                        type: 'income',
                        value: val,
                        category: 'Salário',
                        description: 'Renda Mensal',
                        frequency: 'monthly',
                        rruleString: rruleMonthly,
                        lastGeneratedDate: dateStr,
                        nextDueDate: '',
                        active: true
                    };
                    await postRecurringConfig(config);
                    // Create initial transaction too
                    await postTransaction({
                        id: uuidv4(),
                        type: 'income',
                        value: val,
                        category: 'Salário',
                        date: dateStr,
                        description: 'Renda Inicial'
                    });
                }
            }

            // 2. Rent (Recurring Expense)
            if (rent) {
                const val = parseFloat(rent);
                if (!isNaN(val) && val > 0) {
                    const config: RecurringConfig = {
                        id: uuidv4(),
                        type: 'expense',
                        value: val,
                        category: 'Moradia',
                        description: 'Aluguel/Condomínio',
                        frequency: 'monthly',
                        rruleString: rruleMonthly,
                        lastGeneratedDate: dateStr,
                        nextDueDate: '',
                        active: true
                    };
                    await postRecurringConfig(config);
                    // Create initial transaction
                    await postTransaction({
                        id: uuidv4(),
                        type: 'expense',
                        value: val,
                        category: 'Moradia',
                        date: dateStr,
                        description: 'Aluguel/Condomínio'
                    });
                }
            }

            // 3. Groceries (Budget Estimate - set as transaction)
            if (groceries) {
                const val = parseFloat(groceries);
                if (!isNaN(val) && val > 0) {
                    await postTransaction({
                        id: uuidv4(),
                        type: 'expense',
                        value: val,
                        category: 'Alimentação',
                        date: dateStr,
                        description: 'Estimativa Mercado'
                    });
                }
            }

            // Set Budget Limit based on income (70% rule suggestion)
            const incomeVal = parseFloat(income) || 0;
            if (incomeVal > 0) {
                await updateSettings({ budgetLimit: incomeVal * 0.8 });
            }

            addToast('Perfil configurado com sucesso!', 'success');
            onComplete();
        } catch (e) {
            addToast('Erro ao configurar perfil.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-primary p-6 text-white text-center">
                    <Sparkles size={48} className="mx-auto mb-3 opacity-90" />
                    <h2 className="text-2xl font-bold">Boas-vindas!</h2>
                    <p className="text-teal-100 text-sm mt-1">Vamos organizar sua vida financeira em 30 segundos.</p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
                                <Wallet size={24} />
                                <h3 className="font-semibold text-lg">Qual sua renda mensal aproximada?</h3>
                            </div>
                            <p className="text-gray-500 text-sm">Considere o valor líquido que cai na conta.</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <input
                                    type="number"
                                    autoFocus
                                    value={income}
                                    onChange={e => setIncome(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-emerald-500 rounded-xl text-xl font-bold outline-none"
                                    placeholder="0,00"
                                />
                            </div>
                            <Button onClick={handleNext} disabled={!income} className="w-full mt-4 gap-2">
                                Próximo <ArrowRight size={18} />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                                <Home size={24} />
                                <h3 className="font-semibold text-lg">Gastos fixos de moradia?</h3>
                            </div>
                            <p className="text-gray-500 text-sm">Soma de Aluguel, Condomínio, Luz e Internet.</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <input
                                    type="number"
                                    autoFocus
                                    value={rent}
                                    onChange={e => setRent(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl text-xl font-bold outline-none"
                                    placeholder="0,00"
                                />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button variant="secondary" onClick={() => setStep(1)}>Voltar</Button>
                                <Button onClick={handleNext} className="flex-1 gap-2">Próximo <ArrowRight size={18} /></Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400 mb-2">
                                <ShoppingCart size={24} />
                                <h3 className="font-semibold text-lg">Estimativa de Mercado/Alimentação?</h3>
                            </div>
                            <p className="text-gray-500 text-sm">Quanto você gasta aproximadamente com compras por mês?</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <input
                                    type="number"
                                    autoFocus
                                    value={groceries}
                                    onChange={e => setGroceries(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-orange-500 rounded-xl text-xl font-bold outline-none"
                                    placeholder="0,00"
                                />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button variant="secondary" onClick={() => setStep(2)}>Voltar</Button>
                                <Button onClick={handleFinish} disabled={loading} className="flex-1 gap-2">
                                    {loading ? 'Finalizando...' : 'Gerar Meu Dashboard'} <Check size={18} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-100 dark:border-gray-800">
                    <div className="flex gap-2 justify-center mb-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-primary' : 'w-2 bg-gray-300 dark:bg-gray-700'}`} />
                        ))}
                    </div>
                    <button onClick={onComplete} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline">
                        Pular configuração
                    </button>
                </div>
            </div>
        </div>
    );
};