import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { transactionService } from '../../services/transactionService';
import { useCategories } from '../../hooks/useCategories';
import { Account, Transaction } from '../../types';
import { Loader2, Plus, Sparkles, Save, AlertCircle } from 'lucide-react';
import { useSmartInput } from '../../hooks/useSmartInput';

interface NewTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: Account[];
    isLoadingAccounts?: boolean;
    initialData?: Transaction | null;
    onSuccess: () => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
    isOpen,
    onClose,
    accounts = [], // Default to empty array
    isLoadingAccounts = false,
    initialData,
    onSuccess
}) => {
    const { categories, loading: loadingCats } = useCategories();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [smartText, setSmartText] = useState('');

    // We pass accounts here for fuzzy matching
    const parsed = useSmartInput(smartText, accounts, categories);

    const [form, setForm] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
        category_id: '',
        account_id: ''
    });

    // 4. Initialization & Sync Effects
    useEffect(() => {
        if (!isOpen) {
            setSmartText('');
            return;
        }

        if (initialData) {
            setForm({
                description: initialData.description || '',
                amount: initialData.amount.toString(),
                date: initialData.date,
                type: (initialData.type === 'TRANSFER' ? 'EXPENSE' : initialData.type) as 'INCOME' | 'EXPENSE',
                category_id: initialData.category_id || '',
                account_id: initialData.account_id
            });
        } else {
            setForm({
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                type: 'EXPENSE',
                category_id: '',
                account_id: accounts.length > 0 ? accounts[0].id : ''
            });
        }
    }, [isOpen, initialData, accounts.length]); // Re-run if accounts arrive while open

    // Extra sync to ensure account_id is set once accounts load
    useEffect(() => {
        if (isOpen && accounts.length > 0 && !form.account_id) {
            setForm(f => ({ ...f, account_id: accounts[0].id }));
        }
    }, [isOpen, accounts, form.account_id]);

    // 3. Sync parsed data from the "Magic Bar"
    useEffect(() => {
        if (parsed) {
            setForm(prev => ({
                ...prev,
                ...(parsed.amount !== undefined && { amount: parsed.amount.toString() }),
                ...(parsed.description && { description: parsed.description }),
                ...(parsed.date && { date: parsed.date }),
                ...(parsed.type && { type: parsed.type }),
                ...(parsed.category_id && { category_id: parsed.category_id }),
                ...(parsed.account_id && { account_id: parsed.account_id }),
            }));
        }
    }, [parsed]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.amount || !form.account_id) {
            alert("Por favor, preencha o valor e selecione uma conta.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                description: form.description.trim(),
                amount: parseFloat(form.amount),
                date: form.date,
                type: form.type as 'INCOME' | 'EXPENSE',
                category_id: form.category_id || null,
                account_id: form.account_id,
                is_paid: true
            };

            if (initialData) {
                await transactionService.updateTransaction(initialData.id, payload);
            } else {
                await transactionService.createTransaction(payload);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save transaction:', error);
            alert('Erro ao salvar transação. Verifique sua conexão.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Editar Transação" : "Nova Transação"}
        >
            {/* Smart Input Bar */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 ml-1">
                    <Sparkles size={14} className="text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">Entrada Mágica</span>
                </div>
                <textarea
                    value={smartText}
                    onChange={(e) => setSmartText(e.target.value)}
                    placeholder="Ex: Pizza 45,90 no Nubank ontem..."
                    className="w-full h-20 p-4 bg-indigo-50/50 dark:bg-slate-800/50 border-2 border-dashed border-indigo-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 text-sm focus:border-indigo-400 focus:bg-indigo-50 dark:focus:bg-slate-800 outline-none transition-all resize-none"
                    disabled={isSubmitting}
                    maxLength={200}
                    autoFocus
                    aria-label="Entrada inteligente: digite descrição, valor e data em linguagem natural"
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Toggle */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, type: 'EXPENSE' })}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${form.type === 'EXPENSE'
                            ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm'
                            : 'text-slate-500'
                            }`}
                        disabled={isSubmitting}
                    >
                        Despesa
                    </button>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, type: 'INCOME' })}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${form.type === 'INCOME'
                            ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm'
                            : 'text-slate-500'
                            }`}
                        disabled={isSubmitting}
                    >
                        Receita
                    </button>
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider text-left">Valor</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder="0,00"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg text-slate-900 dark:text-white"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Descrição</label>
                    <input
                        type="text"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="O que você comprou?"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                    {/* Date */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Data</label>
                        <input
                            type="date"
                            required
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Account */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Conta</label>
                        <select
                            required
                            value={form.account_id}
                            onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none text-slate-900 dark:text-white ${!form.account_id && 'border-2 border-rose-500/20'}`}
                            disabled={isSubmitting || isLoadingAccounts}
                        >
                            {isLoadingAccounts ? (
                                <option value="" disabled>Carregando...</option>
                            ) : accounts.length === 0 ? (
                                <option value="" disabled>Nenhuma conta encontrada</option>
                            ) : (
                                <>
                                    <option value="" disabled>Selecionar</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </>
                            )}
                        </select>
                        {accounts.length === 0 && !isLoadingAccounts && (
                            <div className="flex items-center gap-1 mt-1 ml-1 text-rose-500 text-[10px] font-bold">
                                <AlertCircle size={10} />
                                <span>Crie uma conta nas configurações primeiro.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category */}
                <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Categoria</label>
                    <select
                        value={form.category_id}
                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none text-slate-900 dark:text-white"
                        disabled={isSubmitting}
                    >
                        <option value="">Sem categoria</option>
                        {categories.filter(c => c.type === form.type).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {loadingCats && <p className="text-[10px] text-slate-400 mt-1 ml-1">Carregando categorias...</p>}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || (accounts.length === 0 && !initialData)}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            {initialData ? <Save size={20} /> : <Plus size={20} />}
                            {initialData ? "Salvar Alterações" : "Adicionar Transação"}
                        </div>
                    )}
                </button>
            </form>
        </Modal>
    );
};
