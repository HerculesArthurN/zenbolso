import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Account, Category, TransactionType, RecurringConfig } from '../types';
import { ArrowLeft, DollarSign, Wallet, PieChart, Repeat, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, parseCSV } from '../services/csv';
import {
  postAccount, removeAccount, updateSettings,
  getCategories, postCategory, removeCategory,
  getRecurringConfigs, removeRecurringConfig,
  getAccounts, getTransactions, getSettings, importData
} from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { securityService } from '../services/securityService';
import { AppError } from '../utils/AppError';
import { getErrorMessage, getUserFriendlyMessage } from '../utils/errorMapper';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PinSetupModal } from '../components/security/PinSetupModal';
import { useSettingsData, SettingsTab } from '../hooks/useSettingsData';

import { GeneralTab } from '../components/settings/tabs/GeneralTab';
import { AccountsTab } from '../components/settings/tabs/AccountsTab';
import { CategoriesTab } from '../components/settings/tabs/CategoriesTab';
import { RecurringTab } from '../components/settings/tabs/RecurringTab';
import { DataTab } from '../components/settings/tabs/DataTab';

const TAB_CONFIG = [
  { id: 'general',    label: 'Geral',       icon: DollarSign   },
  { id: 'accounts',   label: 'Contas',      icon: Wallet       },
  { id: 'categories', label: 'Categorias',  icon: PieChart     },
  { id: 'recurring',  label: 'Recorrentes', icon: Repeat       },
  { id: 'data',       label: 'Dados',       icon: FileSpreadsheet },
] as const;

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const { activeTab, setActiveTab, resetApp } = useSettingsData();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurringConfigs, setRecurringConfigs] = useState<RecurringConfig[]>([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<TransactionType>('EXPENSE');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [workHours, setWorkHours] = useState('160');
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({ isOpen: false, message: '', onConfirm: () => {} });

  // Security States
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => { 
    loadAllData();
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    const status = await securityService.hasPinSetup();
    setHasPin(status);
  };

  const handleTogglePin = async () => {
    if (hasPin) {
      if (window.confirm("Deseja realmente remover o bloqueio por PIN?")) {
        await securityService.removePin();
        setHasPin(false);
        addToast('Bloqueio removido.', 'success');
      }
    } else {
      setIsPinModalOpen(true);
    }
  };

  const loadAllData = async () => {
    try {
      const [accs, settings, cats, recur] = await Promise.all([
        getAccounts(), getSettings(), getCategories(), getRecurringConfigs()
      ]);
      setAccounts(accs);
      setBudgetLimit(settings.budgetLimit > 0 ? settings.budgetLimit.toString() : '');
      setMonthlyIncome(settings.monthlyIncome ? settings.monthlyIncome.toString() : '');
      setWorkHours(settings.workHoursPerMonth ? settings.workHoursPerMonth.toString() : '160');
      setCategories(cats);
      setRecurringConfigs(recur);
    } catch {
      addToast(getUserFriendlyMessage('DB_READ_ERROR'), 'error');
    }
  };

  const handleSaveGeneral = async () => {
    try {
      const current = await getSettings();
      await updateSettings({
        ...current,
        budgetLimit: parseFloat(budgetLimit) || 0,
        monthlyIncome: parseFloat(monthlyIncome) || 0,
        workHoursPerMonth: parseFloat(workHours) || 160,
      });
      addToast('Configurações salvas!', 'success');
    } catch (e) { addToast(getErrorMessage(e), 'error'); }
  };

  const handleAddAccount = async () => {
    try {
      if (!newAccountName.trim()) throw new AppError('VALIDATION_REQUIRED_FIELD');
      await postAccount({
        id: uuidv4(), name: newAccountName, type: 'WALLET',
        balance: parseFloat(newAccountBalance) || 0,
        color: '#6366f1', user_id: 'local', is_archived: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      });
      setNewAccountName(''); setNewAccountBalance('');
      await loadAllData();
      addToast('Conta criada!', 'success');
    } catch (e) { addToast(getErrorMessage(e), 'error'); }
  };

  const handleDeleteAccount = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Tem certeza? Transações vinculadas a esta conta podem ficar órfãs.',
      onConfirm: async () => {
        try {
          await removeAccount(id); await loadAllData();
          addToast('Conta removida.', 'success');
        } catch (e) { addToast(getErrorMessage(e), 'error'); }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategoryName.trim()) throw new AppError('VALIDATION_REQUIRED_FIELD');
      await postCategory({
        id: uuidv4(), name: newCategoryName,
        type: newCategoryType as 'INCOME' | 'EXPENSE',
        icon: 'Tag', color: '#64748B', user_id: 'local',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      });
      setNewCategoryName(''); await loadAllData();
      addToast('Categoria adicionada!', 'success');
    } catch (e) { addToast(getErrorMessage(e), 'error'); }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await removeCategory(id); await loadAllData();
      addToast('Categoria removida.', 'info');
    } catch (e) { addToast(getErrorMessage(e), 'error'); }
  };

  const handleDeleteRecurring = async (id: string) => {
    try {
      await removeRecurringConfig(id); await loadAllData();
      addToast('Recorrência cancelada.', 'info');
    } catch (e) { addToast(getErrorMessage(e), 'error'); }
  };

  const handleExport = async () => {
    try {
      exportToCSV(await getTransactions());
      addToast('Download iniciado!', 'success');
    } catch (e) { addToast(getErrorMessage(e), 'error'); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const transactions = parseCSV(event.target?.result as string);
        await importData(transactions);
        addToast(`${transactions.length} transações importadas!`, 'success');
        loadAllData();
      } catch (error) { addToast(getErrorMessage(error), 'error'); }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    setConfirmDialog({
      isOpen: true,
      message: 'CUIDADO: Isso apagará TODOS os seus dados. Essa ação é irreversível.',
      onConfirm: async () => {
        await resetApp();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left pb-20">
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

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-sm overflow-hidden flex flex-col h-[75vh] sm:h-[700px]">
        {/* Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto p-4 border-b border-gray-100 dark:border-gray-800 no-scrollbar">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeTab === 'general' && (
            <GeneralTab
              budgetLimit={budgetLimit}
              monthlyIncome={monthlyIncome}
              workHours={workHours}
              onBudgetChange={setBudgetLimit}
              onIncomeChange={setMonthlyIncome}
              onWorkHoursChange={setWorkHours}
              onBlurSave={handleSaveGeneral}
              theme={theme}
              toggleTheme={toggleTheme}
              hasPin={hasPin}
              onTogglePin={handleTogglePin}
            />
          )}
          {activeTab === 'accounts' && (
            <AccountsTab
              accounts={accounts}
              newAccountName={newAccountName}
              newAccountBalance={newAccountBalance}
              onNameChange={setNewAccountName}
              onBalanceChange={setNewAccountBalance}
              onAddAccount={handleAddAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              newCategoryName={newCategoryName}
              newCategoryType={newCategoryType}
              onNameChange={setNewCategoryName}
              onTypeChange={(val) => setNewCategoryType(val as TransactionType)}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
          {activeTab === 'recurring' && (
            <RecurringTab
              recurringConfigs={recurringConfigs}
              onDeleteRecurring={handleDeleteRecurring}
            />
          )}
          {activeTab === 'data' && (
            <DataTab
              onExport={handleExport}
              onImport={handleImport}
              onClearData={handleClearData}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title="Atenção"
        message={confirmDialog.message}
        confirmText="Sim, continuar"
      />

      <PinSetupModal 
        isOpen={isPinModalOpen} 
        onClose={() => {
            setIsPinModalOpen(false);
            checkPinStatus();
        }} 
      />
    </div>
  );
};
