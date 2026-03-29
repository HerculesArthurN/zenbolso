import React, { useState, useEffect } from 'react';
import { Account, Category, TransactionType, RecurringConfig } from '../../types';
import { DollarSign, Wallet, PieChart, Repeat, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, parseCSV } from '../../services/csv';
import {
  postAccount, removeAccount, updateSettings,
  getCategories, postCategory, removeCategory,
  getRecurringConfigs, removeRecurringConfig,
  getAccounts, getTransactions, getSettings, importData
} from '../../services/api';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../../contexts/ToastContext';
import { AppError } from '../../utils/AppError';
import { getErrorMessage, getUserFriendlyMessage } from '../../utils/errorMapper';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useSettingsData, SettingsTab } from '../../hooks/useSettingsData';

import { GeneralTab } from './tabs/GeneralTab';
import { AccountsTab } from './tabs/AccountsTab';
import { CategoriesTab } from './tabs/CategoriesTab';
import { RecurringTab } from './tabs/RecurringTab';
import { DataTab } from './tabs/DataTab';

interface SettingsModalProps {
  onDataUpdate: () => void;
}

const TAB_CONFIG = [
  { id: 'general',    label: 'Geral',       icon: DollarSign   },
  { id: 'accounts',   label: 'Contas',      icon: Wallet       },
  { id: 'categories', label: 'Categorias',  icon: PieChart     },
  { id: 'recurring',  label: 'Recorrentes', icon: Repeat       },
  { id: 'data',       label: 'Dados',       icon: FileSpreadsheet },
] as const;

export const SettingsModal: React.FC<SettingsModalProps> = ({ onDataUpdate }) => {
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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean; message: string; onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => {} });

  useEffect(() => { loadAllData(); }, []);

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
      onDataUpdate();
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
      await loadAllData(); onDataUpdate();
      addToast('Conta criada!', 'success');
    } catch (e) { addToast(getErrorMessage(e), 'error'); }
  };

  const handleDeleteAccount = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Tem certeza? Transações vinculadas a esta conta podem ficar órfãs.',
      onConfirm: async () => {
        try {
          await removeAccount(id); await loadAllData(); onDataUpdate();
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
        onDataUpdate();
      } catch (error) { addToast(getErrorMessage(error), 'error'); }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    setConfirmDialog({
      isOpen: true,
      message: 'CUIDADO: Isso apagará TODOS os seus dados. Essa ação é irreversível.',
      onConfirm: async () => {
        // Golden Rule: usa resetApp() do hook, que chama db.delete() corretamente
        await resetApp();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <>
      <div className="flex flex-col h-[70vh] sm:h-[600px]">
        {/* Tab Bar */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 mb-4 border-b border-gray-100 dark:border-gray-800 no-scrollbar">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
          {activeTab === 'general' && (
            <GeneralTab
              budgetLimit={budgetLimit} monthlyIncome={monthlyIncome} workHours={workHours}
              onBudgetChange={setBudgetLimit} onIncomeChange={setMonthlyIncome}
              onWorkHoursChange={setWorkHours} onBlurSave={handleSaveGeneral}
            />
          )}
          {activeTab === 'accounts' && (
            <AccountsTab
              accounts={accounts} newAccountName={newAccountName} newAccountBalance={newAccountBalance}
              onNameChange={setNewAccountName} onBalanceChange={setNewAccountBalance}
              onAddAccount={handleAddAccount} onDeleteAccount={handleDeleteAccount}
            />
          )}
          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories} newCategoryName={newCategoryName} newCategoryType={newCategoryType}
              onNameChange={setNewCategoryName} onTypeChange={setNewCategoryType}
              onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory}
            />
          )}
          {activeTab === 'recurring' && (
            <RecurringTab recurringConfigs={recurringConfigs} onDeleteRecurring={handleDeleteRecurring} />
          )}
          {activeTab === 'data' && (
            <DataTab onExport={handleExport} onImport={handleImport} onClearData={handleClearData} />
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        message={confirmDialog.message}
        title="Atenção"
        confirmText="Sim, continuar"
      />
    </>
  );
};