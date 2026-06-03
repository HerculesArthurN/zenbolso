import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionType } from '../types';
import { ArrowLeft, DollarSign, Wallet, PieChart, Repeat, FileSpreadsheet } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PinSetupModal } from '../components/security/PinSetupModal';
import { useSettings } from '../hooks/useSettings';
import { SettingsTab } from '../hooks/useSettingsData';

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
  const {
    theme, toggleTheme,
    activeTab, setActiveTab,
    accounts, categories, recurringConfigs,
    newAccountName, newAccountBalance,
    newCategoryName, newCategoryType,
    budgetLimit, monthlyIncome, workHours,
    confirmDialog, setConfirmDialog,
    isPinModalOpen, setIsPinModalOpen,
    hasPin, checkPinStatus,
    setNewAccountName, setNewAccountBalance,
    setNewCategoryName, setNewCategoryType,
    setBudgetLimit, setMonthlyIncome, setWorkHours,
    handleTogglePin, handleSaveGeneral,
    handleAddAccount, handleDeleteAccount,
    handleAddCategory, handleDeleteCategory,
    handleDeleteRecurring, handleExport,
    handleImport, handleClearData
  } = useSettings();

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
