import React, { useState, useEffect } from 'react';
import { Account, Category, TransactionType, RecurringConfig } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { securityService } from '../services/securityService';
import { AppError } from '../utils/AppError';
import { getErrorMessage, getUserFriendlyMessage } from '../utils/errorMapper';
import { v4 as uuidv4 } from 'uuid';
import { exportToCSV, parseCSV } from '../services/csv';
import {
  postAccount, removeAccount, updateSettings,
  getCategories, postCategory, removeCategory,
  getRecurringConfigs, removeRecurringConfig,
  getAccounts, getTransactions, getSettings, importData
} from '../services/api';
import { useSettingsData } from './useSettingsData';

export function useSettings() {
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
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
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => {} });

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
      setBudgetLimit(settings.budgetLimit > 0 ? (settings.budgetLimit / 100).toString() : '');
      setMonthlyIncome(settings.monthlyIncome ? (settings.monthlyIncome / 100).toString() : '');
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
        budgetLimit: Math.round((parseFloat(budgetLimit) || 0) * 100),
        monthlyIncome: Math.round((parseFloat(monthlyIncome) || 0) * 100),
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
        balance: Math.round((parseFloat(newAccountBalance) || 0) * 100),
        color: '#6366f1', user_id: 'local', is_archived: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      });
      setNewAccountName(''); setNewAccountBalance('');
      await loadAllData();
      addToast('Conta criada!', 'success');
    } catch (e) { addToast(getErrorMessage(e), 'error'); }
  };

  const handleDeleteAccount = (id: string) => {
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

  return {
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
  };
}
