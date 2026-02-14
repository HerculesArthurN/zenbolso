import React, { useState, useEffect } from 'react';
import { recurringService } from '../services/recurringService';
import { useDashboardData } from '../hooks/useDashboardData';
import { useCategories } from '../hooks/useCategories';
import { RecurringTransaction } from '../types';
import { Calendar, Trash2, Plus, Loader2, DollarSign, ToggleLeft, ToggleRight, CreditCard, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { safeNumber } from '../utils/numberUtils';

export const RecurringPage: React.FC = () => {
    const { accounts, loading: loadingAccounts } = useDashboardData();
    const { categories, loading: loadingCats } = useCategories();
    const { addToast } = useToast();

    const [rules, setRules] = useState<RecurringTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        description: '',
        amount: '',
        day_of_month: '1',
        type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
        account_id: '',
        category_id: ''
    });

    const fetchRules = async () => {
        setLoading(true);
        try {
            const data = await recurringService.getRecurring();
            setRules(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    // Effect to set default account when accounts load
    useEffect(() => {
        if (accounts.length > 0 && !form.account_id) {
            setForm(f => ({ ...f, account_id: accounts[0].id }));
        }
    }, [accounts, form.account_id]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Excluir esta regra de recorrência?')) return;
        try {
            await recurringService.deleteRecurring(id);
            addToast('Regra excluída com sucesso', 'success');
            fetchRules();
        } catch (error) {
            addToast('Erro ao excluir regra', 'error');
        }
    };

    const handleToggle = async (rule: RecurringTransaction) => {
        try {
            await recurringService.toggleActive(rule.id, !rule.active);
            addToast(rule.active ? 'Regra pausada' : 'Regra ativada', 'info');
            fetchRules();
        } catch (error) {
            addToast('Erro ao atualizar status', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.amount || !form.account_id || !form.description) {
            addToast('Preencha os campos obrigatórios', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await recurringService.addRecurring({
                description: form.description,
                amount: parseFloat(form.amount),
                day_of_month: parseInt(form.day_of_month),
                type: form.type,
                account_id: form.account_id,
                category_id: form.category_id || null
            });
            addToast('Regra criada! Lançamentos serão feitos no dia escolhido.', 'success');
            setIsModalOpen(false);
            fetchRules();
            setForm({
                description: '',
                amount: '',
                day_of_month: '1',
                type: 'EXPENSE',
                account_id: accounts[0]?.id || '',
                category_id: ''
            });
        } catch (error) {
            addToast('Erro ao criar regra', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Recorrências</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Automatize suas contas fixas e salários.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                >
                    <Plus size={20} /> Nova Regra
                </button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-slate-400 text-sm animate-pulse">Carregando suas assinaturas...</p>
                </div>
            ) : rules.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all">
                    <div className="bg-slate-50 dark:bg-slate-800/50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Calendar className="text-slate-300 dark:text-slate-600" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sem automações ainda</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8">
                        Adicione contas que se repetem todo mês (Netflix, Aluguel, Salário) para nunca mais esquecer de lançar.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        Criar minha primeira regra
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {rules.map(rule => {
                        const account = accounts.find(a => a.id === rule.account_id);
                        return (
                            <div key={rule.id} className={`group bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:shadow-md ${!rule.active && 'opacity-60 grayscale'}`}>
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 rounded-2xl ${rule.type === 'INCOME'
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                        : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                                        {rule.type === 'INCOME' ? <Plus size={24} /> : <DollarSign size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">{rule.description}</h4>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                            <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">Todo dia {rule.day_of_month}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <span className={`text-sm font-bold ${rule.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                                {formatCurrency(safeNumber(rule.amount, 0))}
                                            </span>
                                            {account && (
                                                <>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <CreditCard size={10} /> {account.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleToggle(rule)}
                                        className="p-3 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors"
                                        title={rule.active ? "Pausar" : "Ativar"}
                                    >
                                        {rule.active ? <ToggleRight size={36} className="text-indigo-600" /> : <ToggleLeft size={36} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(rule.id)}
                                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Recorrência">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Toggle */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: 'EXPENSE' })}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${form.type === 'EXPENSE'
                                ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm'
                                : 'text-slate-500'
                                }`}
                        >
                            Despesa
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: 'INCOME' })}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${form.type === 'INCOME'
                                ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm'
                                : 'text-slate-500'
                                }`}
                        >
                            Receita
                        </button>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Descrição</label>
                            <input
                                type="text"
                                required
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Ex: Assinatura Netflix"
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Valor</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        placeholder="0,00"
                                        className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Dia do Mês</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    required
                                    value={form.day_of_month}
                                    onChange={(e) => setForm({ ...form, day_of_month: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Account */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Conta</label>
                            <select
                                required
                                value={form.account_id}
                                onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none text-slate-900 dark:text-white"
                                disabled={loadingAccounts}
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Categoria</label>
                            <select
                                value={form.category_id}
                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none text-slate-900 dark:text-white"
                                disabled={loadingCats}
                            >
                                <option value="">Sem categoria</option>
                                {categories.filter(c => c.type === form.type).map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl leading-relaxed">
                        <AlertCircle size={12} className="inline mr-1 mb-0.5" />
                        Esta transação será gerada automaticamente todo mês no dia escolhido, assim que você abrir o aplicativo.
                    </p>

                    <button
                        type="submit"
                        disabled={isSubmitting || accounts.length === 0}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                        Criar Automação
                    </button>
                </form>
            </Modal>
        </div>
    );
};
