import React from 'react';
import { Modal } from '../ui/Modal';
import { Account, Transaction } from '../../types';
import { Loader2, Plus, Save } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useTransactionForm } from '../../hooks/useTransactionForm';

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
    accounts = [],
    isLoadingAccounts = false,
    initialData,
    onSuccess
}) => {
    const { categories, loading: loadingCats } = useCategories();
    
    // 🔥 Dumb Component: 100% of business logic delegated to the hook!
    const { 
        formData, 
        errors, 
        isSubmitting, 
        updateField, 
        submitTransaction 
    } = useTransactionForm({
        initialData,
        accounts,
        onSuccess: () => {
            onSuccess();
            onClose();
        }
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitTransaction();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Editar Transação" : "Nova Transação"}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Toggle */}
                <div role="group" aria-label="Tipo de Transação" className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <button
                        type="button"
                        onClick={() => updateField('type', 'EXPENSE')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${formData.type === 'EXPENSE'
                            ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm'
                            : 'text-slate-500'
                            }`}
                        disabled={isSubmitting}
                        aria-pressed={formData.type === 'EXPENSE'}
                    >
                        Despesa
                    </button>
                    <button
                        type="button"
                        onClick={() => updateField('type', 'INCOME')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${formData.type === 'INCOME'
                            ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm'
                            : 'text-slate-500'
                            }`}
                        disabled={isSubmitting}
                        aria-pressed={formData.type === 'INCOME'}
                    >
                        Receita
                    </button>
                </div>
                {errors.type && <p className="text-rose-500 text-xs mt-1 ml-1 text-left">{errors.type}</p>}

                {/* Amount */}
                <div>
                    <label htmlFor="input-amount" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider text-left">Valor</label>
                    <div className="relative text-left">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" aria-hidden="true">R$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount || ''}
                            onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                            placeholder="0,00"
                            id="input-amount"
                            className={`w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg text-slate-900 dark:text-white ${errors.amount ? 'ring-2 ring-rose-500' : ''}`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.amount && <p className="text-rose-500 text-xs mt-1 ml-1 text-left">{errors.amount}</p>}
                </div>

                {/* Description */}
                <div className="text-left">
                    <label htmlFor="input-description" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Descrição</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="O que você comprou?"
                        id="input-description"
                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white ${errors.description ? 'ring-2 ring-rose-500' : ''}`}
                        disabled={isSubmitting}
                    />
                    {errors.description && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                    {/* Date */}
                    <div>
                        <label htmlFor="input-date" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Data</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => updateField('date', e.target.value)}
                            id="input-date"
                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white ${errors.date ? 'ring-2 ring-rose-500' : ''}`}
                            disabled={isSubmitting}
                        />
                        {errors.date && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.date}</p>}
                    </div>

                    {/* Account */}
                    <div>
                        <label htmlFor="input-account" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Conta</label>
                        <select
                            value={formData.accountId}
                            onChange={(e) => updateField('accountId', e.target.value)}
                            id="input-account"
                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none text-slate-900 dark:text-white ${errors.accountId ? 'ring-2 ring-rose-500' : ''}`}
                            disabled={isSubmitting || isLoadingAccounts}
                        >
                            {isLoadingAccounts ? (
                                <option value="" disabled>Carregando...</option>
                            ) : accounts.length === 0 ? (
                                <option value="" disabled>Nenhuma conta</option>
                            ) : (
                                <>
                                    <option value="" disabled>Selecionar</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </>
                            )}
                        </select>
                        {errors.accountId && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.accountId}</p>}
                    </div>
                </div>

                {/* Category */}
                <div className="text-left">
                    <label htmlFor="input-category" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Categoria</label>
                    <select
                        value={formData.categoryId}
                        onChange={(e) => updateField('categoryId', e.target.value)}
                        id="input-category"
                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none text-slate-900 dark:text-white ${errors.categoryId ? 'ring-2 ring-rose-500' : ''}`}
                        disabled={isSubmitting}
                    >
                        <option value="">Sem categoria</option>
                        {categories.filter(c => c.type === formData.type).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {loadingCats && <p className="text-[10px] text-slate-400 mt-1 ml-1">Carregando...</p>}
                    {errors.categoryId && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.categoryId}</p>}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    id="btn-save-transaction"
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
