import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { useProfileSettings } from '../hooks/useProfileSettings';
import { useSettingsData } from '../hooks/useSettingsData';
import { useToast } from '../contexts/ToastContext';
import { DataManagement } from '../components/settings/DataManagement'; // Import DataManagement
import { Account, Category } from '../types';
import { securityService } from '../services/securityService';
import {
    ArrowLeft,
    User,
    Wallet,
    Save,
    Plus,
    Trash2,
    Briefcase,
    Target,
    Moon,
    Sun,
    Loader2,
    Lock
} from 'lucide-react';
import { PinSetupModal } from '../components/security/PinSetupModal';

export const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { theme, toggleTheme } = useTheme();
    const { profile, updateProfile, isLoading: loadingProfile } = useProfileSettings();
    const { resetApp } = useSettingsData();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Local form states
    const [localProfile, setLocalProfile] = useState(profile);
    const [newCatName, setNewCatName] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [hasPin, setHasPin] = useState(false);

    const checkPinStatus = async () => {
        const status = await securityService.hasPinSetup();
        setHasPin(status);
    };

    useEffect(() => {
        if (!loadingProfile) {
            setLocalProfile(profile);
        }
    }, [profile, loadingProfile]);

    const fetchData = async () => {
        try {
            const [accs, cats] = await Promise.all([
                accountService.fetchAccounts(),
                categoryService.fetchCategories()
            ]);
            setAccounts(accs);
            setCategories(cats);
        } catch (err) {
            addToast('Erro ao carregar dados.', 'error');
        }
    };

    useEffect(() => {
        fetchData();
        checkPinStatus();
    }, []);

    const handleTogglePin = async () => {
        if (hasPin) {
            const confirmacao = window.confirm("Deseja realmente remover o bloqueio por PIN?");
            if (confirmacao) {
                await securityService.removePin();
                setHasPin(false);
                addToast('Bloqueio removido.', 'success');
            }
        } else {
            setIsPinModalOpen(true);
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            await updateProfile(localProfile);
            addToast('Perfil financeiro atualizado!', 'success');
        } catch (err) {
            addToast('Erro ao salvar perfil.', 'error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAddAccount = async () => {
        const name = prompt('Nome da nova conta:');
        if (!name) return;
        setIsAddingAccount(true);
        try {
            const newAcc = await accountService.createAccount({
                name,
                balance: 0,
                type: 'WALLET',
                color: '#0D9488'
            });
            setAccounts([...accounts, newAcc]);
            addToast('Conta criada!', 'success');
        } catch (err) {
            addToast('Erro ao criar conta.', 'error');
        } finally {
            setIsAddingAccount(false);
        }
    };

    const handleDeleteAccount = async (id: string) => {
        if (!confirm('Excluir esta conta?')) return;
        setDeletingId(id);
        try {
            await accountService.deleteAccount(id);
            setAccounts(accounts.filter(a => a.id !== id));
            addToast('Conta removida.', 'success');
        } catch (err: any) {
            if (err.message === 'HAS_DATA') {
                addToast('Não é possível excluir uma conta com movimentações. Tente arquivar ou excluir as transações primeiro.', 'error');
            } else {
                addToast('Erro ao excluir conta.', 'error');
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleAddCategory = async () => {
        if (!newCatName.trim()) return;
        setIsAddingCategory(true);
        try {
            const freshCat = await categoryService.createCategory({
                name: newCatName.trim(),
                type: 'EXPENSE',
                icon: 'Tag',
                color: '#6366f1'
            });
            setCategories([...categories, freshCat]);
            setNewCatName('');
            addToast('Categoria criada!', 'success');
        } catch (err) {
            addToast('Erro ao criar categoria.', 'error');
        } finally {
            setIsAddingCategory(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Excluir esta categoria?')) return;
        setDeletingId(id);
        try {
            await categoryService.deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
            addToast('Categoria removida.', 'success');
        } catch (err: any) {
            if (err.message === 'HAS_DATA') {
                addToast('Não é possível excluir uma categoria em uso. Remova as transações vinculadas primeiro.', 'error');
            } else {
                addToast('Erro ao excluir categoria.', 'error');
            }
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left pb-20">
            {/* Header */}
            <header className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95"
                    aria-label="Voltar"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configurações</h1>
                    <p className="text-slate-500 dark:text-slate-400">Hub central do seu ZenBolso.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* COLUMN LEFT */}
                <div className="space-y-8">

                    {/* SECTION 1: PERFIL & SIMULADOR */}
                    <section className="bg-white dark:bg-slate-900/40 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <User size={20} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Seu Perfil</h2>
                                <p className="text-xs text-slate-500 font-medium">Conta Local</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="income" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Renda Mensal</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                                    <input
                                        id="income"
                                        type="number"
                                        value={localProfile.monthlyIncome || ''}
                                        onChange={e => setLocalProfile({ ...localProfile, monthlyIncome: Number(e.target.value) })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all"
                                        placeholder="0,00"
                                        aria-label="Renda mensal líquida"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="hours" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Horas de Trabalho/Mês</label>
                                <div className="relative">
                                    <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        id="hours"
                                        type="number"
                                        value={localProfile.workHoursPerMonth || ''}
                                        onChange={e => setLocalProfile({ ...localProfile, workHoursPerMonth: Number(e.target.value) })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all"
                                        placeholder="160"
                                        aria-label="Horas trabalhadas por mês"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="budget" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Teto de Gastos</label>
                                <div className="relative">
                                    <Target size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        id="budget"
                                        type="number"
                                        value={localProfile.monthlyBudgetLimit || ''}
                                        onChange={e => setLocalProfile({ ...localProfile, monthlyBudgetLimit: Number(e.target.value) })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all"
                                        placeholder="Defina seu limite"
                                        aria-label="Teto de gastos mensal"
                                    />
                                </div>
                            </div>


                            <button
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                            >
                                {isSavingProfile ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </section>

                    {/* SECTION 2: APARÊNCIA & SISTEMA */}
                    <section className="bg-white dark:bg-slate-900/40 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
                                <Sun size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Aparência</h2>
                        </div>

                        <div className="space-y-4">
                            <div
                                onClick={toggleTheme}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-500 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    {theme === 'dark' ? <Moon size={20} className="text-indigo-500" /> : <Sun size={20} className="text-amber-500" />}
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">Modo {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
                                </div>
                                <div className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                                </div>
                            </div>

                            <div className="pt-2 text-center">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ZenBolso v1.3.0 (Local-First)</p>
                            </div>
                        </div>
                    </section>

                    {/* NEW SECTION: SEGURANÇA */}
                    <section className="bg-white dark:bg-slate-900/40 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <Lock size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Segurança</h2>
                        </div>
                        <div className="space-y-4">
                            <button
                                onClick={handleTogglePin}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                                    hasPin 
                                    ? 'bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 hover:border-rose-500' 
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                                }`}
                            >
                                <div className="flex flex-col text-left">
                                    <span className={`font-bold text-sm ${hasPin ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                                        Bloqueio por PIN
                                    </span>
                                    <span className={`text-[10px] font-medium ${hasPin ? 'text-rose-500/70' : 'text-slate-500'}`}>
                                        {hasPin ? 'Ativado (Clique para remover)' : 'Exigir senha ao abrir o app'}
                                    </span>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative transition-colors ${hasPin ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-emerald-500/20'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${hasPin ? 'bg-white left-7' : 'bg-slate-400 dark:bg-slate-600 left-1 group-hover:bg-emerald-500'}`} />
                                </div>
                            </button>
                        </div>
                    </section>
                </div>

                {/* COLUMN RIGHT */}
                <div className="space-y-8">

                    {/* NEW SECTION: DATA MANAGEMENT */}
                    <DataManagement />

                    {/* SECTION 3: GERENCIAMENTO DE RECURSOS */}
                    <section className="bg-white dark:bg-slate-900/40 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                    <Wallet size={20} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Recursos</h2>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Accounts */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Contas</h3>
                                    <button
                                        onClick={handleAddAccount}
                                        disabled={isAddingAccount}
                                        className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50 font-bold text-xs flex items-center gap-1"
                                    >
                                        {isAddingAccount ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                        {isAddingAccount ? 'Criando...' : 'Nova Conta'}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {accounts.map(acc => (
                                        <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 group">
                                            <div className="flex items-center gap-3 font-bold text-sm text-slate-700 dark:text-slate-300">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
                                                {acc.name}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAccount(acc.id)}
                                                disabled={deletingId === acc.id}
                                                className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-all"
                                            >
                                                {deletingId === acc.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Categorias</h3>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCatName}
                                        onChange={e => setNewCatName(e.target.value)}
                                        placeholder="Nova categoria..."
                                        className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none text-xs font-bold text-slate-900 dark:text-white"
                                    />
                                    <button
                                        onClick={handleAddCategory}
                                        disabled={isAddingCategory}
                                        className="p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isAddingCategory ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    </button>
                                </div>
                                <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 group">
                                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{cat.name}</span>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                disabled={deletingId === cat.id}
                                                className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-all"
                                            >
                                                {deletingId === cat.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Danger Zone Footnote */}
            <div className="mt-12 flex justify-center">
                <button
                    onClick={async () => {
                        if (confirm('Isso apagará TODOS os dados do seu navegador. Tem certeza?')) {
                            await resetApp();
                        }
                    }}
                    className="text-[10px] font-black uppercase text-rose-500/40 hover:text-rose-500 hover:underline tracking-[0.3em] transition-all"
                >
                    Resetar Aplicativo (Perigo)
                </button>
            </div>

            {/* Modal de Setup do PIN */}
            <PinSetupModal 
                isOpen={isPinModalOpen} 
                onClose={() => {
                    setIsPinModalOpen(false);
                    checkPinStatus(); // Atualiza a chave ao fechar o modal
                }} 
            />
        </div>
    );
};
