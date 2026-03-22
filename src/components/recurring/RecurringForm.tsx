import React, { useState, useEffect } from 'react';
import { Account, RecurringTransaction, Category } from '../../types';
import { Loader2, Plus, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { z } from 'zod';

const formSchema = z.object({
    description: z.string().min(1, 'Descrição é obrigatória'),
    amount: z.number().positive('O valor deve ser maior que zero'),
    day_of_month: z.number().min(1, 'Dia menor que 1').max(31, 'Dia maior que 31'),
    type: z.enum(['INCOME', 'EXPENSE']),
    account_id: z.string().min(1, 'Selecione uma conta'),
    category_id: z.string().optional()
});

interface RecurringFormProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: Account[];
    categories: Category[];
    onSubmit: (rule: Partial<RecurringTransaction>) => Promise<any>;
}

export const RecurringForm: React.FC<RecurringFormProps> = ({ isOpen, onClose, accounts, categories, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        description: '',
        amount: '',
        day_of_month: '1',
        type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
        account_id: '',
        category_id: ''
    });

    useEffect(() => {
        if (isOpen && accounts.length > 0 && !form.account_id) {
            setForm(f => ({ ...f, account_id: accounts[0].id }));
        }
    }, [isOpen, accounts, form.account_id]);

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...form,
            amount: parseFloat(form.amount) || 0,
            day_of_month: parseInt(form.day_of_month) || 1
        };

        const result = formSchema.safeParse(payload);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                description: payload.description,
                amount: payload.amount,
                day_of_month: payload.day_of_month,
                type: payload.type,
                account_id: payload.account_id,
                category_id: payload.category_id || null
            });
            
            setForm({
                description: '',
                amount: '',
                day_of_month: '1',
                type: 'EXPENSE',
                account_id: accounts[0]?.id || '',
                category_id: ''
            });
            onClose();
        } catch (error) {
            setErrors({ root: 'Erro ao salvar recursão.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Recorrência">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Toggle */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => handleChange('type', 'EXPENSE')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${form.type === 'EXPENSE'
                            ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm'
                            : 'text-slate-500'}`}
                    >
                        Despesa
                    </button>
                    <button
                        type="button"
                        onClick={() => handleChange('type', 'INCOME')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${form.type === 'INCOME'
                            ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm'
                            : 'text-slate-500'}`}
                    >
                        Receita
                    </button>
                </div>
                {errors.type && <p className="text-rose-500 text-xs ml-1">{errors.type}</p>}

                {/* Basic Info */}
                <div className="space-y-4">
                    <div className="text-left">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Descrição</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Ex: Assinatura Netflix"
                            className={`w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white ${errors.description && 'ring-2 ring-rose-500'}`}
                            disabled={isSubmitting}
                        />
                        {errors.description && <p className="text-rose-500 text-[10px] mt-1 ml-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Valor</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.amount}
                                    onChange={(e) => handleChange('amount', e.target.value)}
                                    placeholder="0,00"
                                    className={`w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 dark:text-white ${errors.amount && 'ring-2 ring-rose-500'}`}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.amount && <p className="text-rose-500 text-[10px] mt-1 ml-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Dia do Mês</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                value={form.day_of_month}
                                onChange={(e) => handleChange('day_of_month', e.target.value)}
                                className={`w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 dark:text-white ${errors.day_of_month && 'ring-2 ring-rose-500'}`}
                                disabled={isSubmitting}
                            />
                            {errors.day_of_month && <p className="text-rose-500 text-[10px] mt-1 ml-1">{errors.day_of_month}</p>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                    {/* Account */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Conta</label>
                        <select
                            value={form.account_id}
                            onChange={(e) => handleChange('account_id', e.target.value)}
                            className={`w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none text-slate-900 dark:text-white ${errors.account_id && 'ring-2 ring-rose-500'}`}
                            disabled={isSubmitting || accounts.length === 0}
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                        {errors.account_id && <p className="text-rose-500 text-[10px] mt-1 ml-1">{errors.account_id}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Categoria</label>
                        <select
                            value={form.category_id}
                            onChange={(e) => handleChange('category_id', e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none text-slate-900 dark:text-white"
                            disabled={isSubmitting}
                        >
                            <option value="">Sem categoria</option>
                            {categories.filter(c => c.type === form.type).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <p className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl leading-relaxed text-left">
                    <AlertCircle size={12} className="inline mr-1 mb-0.5" />
                    Esta transação será gerada automaticamente todo mês no dia escolhido, assim que você abrir o aplicativo.
                </p>

                {errors.root && <p className="text-rose-500 font-bold text-sm text-center">{errors.root}</p>}

                <button
                    type="submit"
                    disabled={isSubmitting || accounts.length === 0}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                    Criar Automação
                </button>
            </form>
        </Modal>
    );
};
