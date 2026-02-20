import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { Transaction, TransactionType } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useAccountsQuery, useCategoriesQuery, useFinanceMutations } from './useFinanceData';
import { processInstallments, createRecurringTransaction } from '../services/transaction.business';
import { AppError } from '../utils/AppError';
import { getErrorMessage } from '../utils/errorMapper';
import { v4 as uuidv4 } from 'uuid';

interface UseTransactionFormProps {
  onSave: (t: Transaction) => void;
  onCancel: () => void;
  // history removed
  initialData?: Transaction | null;
}

export const useTransactionForm = ({ onSave, onCancel, initialData }: UseTransactionFormProps) => {
  const { addToast } = useToast();
  const { refreshTransactions } = useFinanceMutations();

  // Data Fetching
  const { data: accounts = [] } = useAccountsQuery();
  const { data: availableCategories = [] } = useCategoriesQuery();

  // Form State
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [valueRaw, setValueRaw] = useState<number>(0);
  const [valueDisplay, setValueDisplay] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');
  const [accountId, setAccountId] = useState('');
  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Recurrence & Installments
  const [repeatMode, setRepeatMode] = useState<'none' | 'recurring' | 'installments'>('none');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [installments, setInstallments] = useState(2);

  // Initialization
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      updateValue(initialData.amount);
      setCategory(initialData.category_id || '');
      setDate(initialData.date);
      setDescription(initialData.description || '');
      // tags removed
      setAccountId(initialData.account_id || (accounts.length > 0 ? accounts[0].id : ''));
    } else if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [initialData, accounts]);

  // Helpers
  const updateValue = (val: number) => {
    setValueRaw(val);
    setValueDisplay(val.toFixed(2).replace('.', ','));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    const numberValue = parseInt(val) / 100;

    if (isNaN(numberValue)) {
      setValueRaw(0);
      setValueDisplay('');
    } else {
      setValueRaw(numberValue);
      setValueDisplay(numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (valueRaw <= 0) throw new AppError('VALIDATION_INVALID_VALUE');
      if (!category) throw new AppError('VALIDATION_NO_CATEGORY');
      if (!accountId) throw new AppError('VALIDATION_NO_ACCOUNT');

      // Case 1: Installments
      if (repeatMode === 'installments' && !initialData) {
        const firstTx = await processInstallments({
          user_id: '',
          type,
          amount: valueRaw,
          category_id: category,
          date,
          description,
          account_id: accountId,
          is_paid: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, installments);
        onSave(firstTx);
        return;
      }

      // Case 2: Recurring
      if (repeatMode === 'recurring' && !initialData) {
        await createRecurringTransaction({
          user_id: '',
          account_id: accountId,
          type,
          amount: valueRaw,
          category_id: category,
          description,
          date,
          frequency
        });
        await refreshTransactions();
        addToast('Recorrência configurada!', 'success');
        onCancel();
        return;
      }

      // Case 3: Standard
      const newTransaction: Transaction = {
        id: initialData?.id || uuidv4(),
        user_id: '',
        type,
        amount: valueRaw,
        category_id: category,
        date,
        description: description || null,
        account_id: accountId,
        is_paid: true,
        created_at: initialData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onSave(newTransaction);
    } catch (error) {
      addToast(getErrorMessage(error), 'error');
    }
  };

  const currentCategories = useMemo(() => {
    return availableCategories
      .filter(c => c.type === type)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [availableCategories, type]);

  return {
    type, setType,
    valueRaw, valueDisplay, handleCurrencyChange,
    category, setCategory,
    description, setDescription,
    date, setDate,
    tags, setTags,
    accountId, setAccountId,
    showAdvanced, setShowAdvanced,
    repeatMode, setRepeatMode,
    frequency, setFrequency,
    installments, setInstallments,
    accounts,
    currentCategories,
    handleSubmit
  };
};
