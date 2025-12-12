import React, { useState, useEffect, useMemo, FormEvent, useCallback } from 'react';
import { Transaction, TransactionType } from '../types';
import { useToast } from '../context/ToastContext';
import { useAccountsQuery, useCategoriesQuery, useFinanceMutations } from './useFinanceData';
import { parseSmartInput, ParsedTransaction } from '../services/smartParser';
import { processInstallments, createRecurringTransaction } from '../services/transaction.business';
import { AppError } from '../utils/AppError';
import { getErrorMessage } from '../utils/errorMapper';
import { v4 as uuidv4 } from 'uuid';
import Fuse from 'fuse.js';

interface UseTransactionFormProps {
  onSave: (t: Transaction) => void;
  onCancel: () => void;
  history: Transaction[];
  initialData?: Transaction | null;
}

export const useTransactionForm = ({ onSave, onCancel, history, initialData }: UseTransactionFormProps) => {
  const { addToast } = useToast();
  const { refreshTransactions } = useFinanceMutations();
  
  // Data Fetching
  const { data: accounts = [] } = useAccountsQuery();
  const { data: availableCategories = [] } = useCategoriesQuery();

  // Form State
  const [type, setType] = useState<TransactionType>('expense');
  const [valueRaw, setValueRaw] = useState<number>(0);
  const [valueDisplay, setValueDisplay] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');
  const [accountId, setAccountId] = useState('');
  
  // Smart Input & Parsing State
  const [smartInput, setSmartInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedTransaction | null>(null);

  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);

  // Recurrence & Installments
  const [repeatMode, setRepeatMode] = useState<'none' | 'recurring' | 'installments'>('none');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [installments, setInstallments] = useState(2);

  // Initialization
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      updateValue(initialData.value);
      setCategory(initialData.category);
      setDate(initialData.date);
      setDescription(initialData.description || '');
      setTags(initialData.tags ? initialData.tags.join(', ') : '');
      setAccountId(initialData.accountId || (accounts.length > 0 ? accounts[0].id : ''));
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

  // --- Smart Parsing Logic com Debounce ---
  useEffect(() => {
    if (!smartInput.trim() || initialData) return;

    setIsParsing(true);
    const timer = setTimeout(() => {
      const parsed = parseSmartInput(smartInput, availableCategories, accounts);
      setParsedPreview(parsed);
      
      // Auto-fill form fields if confidence is high (or just fill whatever matches)
      if (parsed.value) updateValue(parsed.value);
      if (parsed.type) setType(parsed.type);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.accountId) setAccountId(parsed.accountId);
      if (parsed.date) setDate(parsed.date);
      if (parsed.description) setDescription(parsed.description);
      
      if (parsed.isRecurring && parsed.recurrenceFrequency) {
        setRepeatMode('recurring');
        setFrequency(parsed.recurrenceFrequency);
      }

      setIsParsing(false);
    }, 500); // 500ms Debounce

    return () => clearTimeout(timer);
  }, [smartInput, availableCategories, accounts, initialData]);

  // Category Suggestion (Fuse.js on History)
  const fuse = useMemo(() => new Fuse(history, { keys: ['description'], threshold: 0.4 }), [history]);

  useEffect(() => {
    if (description.length > 2 && !category && !initialData) {
      const results = fuse.search(description);
      if (results.length > 0) {
        const match = results.find(r => r.item.type === type);
        if (match && match.item.category !== category) {
          setSuggestedCategory(match.item.category);
        }
      }
    } else {
      setSuggestedCategory(null);
    }
  }, [description, fuse, type, category, initialData]);

  const applySuggestion = () => {
    if (suggestedCategory) {
      setCategory(suggestedCategory);
      setSuggestedCategory(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (valueRaw <= 0) throw new AppError('VALIDATION_INVALID_VALUE');
      if (!category) throw new AppError('VALIDATION_NO_CATEGORY');
      if (!accountId) throw new AppError('VALIDATION_NO_ACCOUNT');

      const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : undefined;

      // Case 1: Installments
      if (repeatMode === 'installments' && !initialData) {
        const firstTx = await processInstallments({
          type, value: valueRaw, category, date, description, tags: tagsArray, accountId
        }, installments);
        onSave(firstTx);
        return;
      }

      // Case 2: Recurring
      if (repeatMode === 'recurring' && !initialData) {
        await createRecurringTransaction({
          type, value: valueRaw, category, description, tags: tagsArray, date, frequency
        });
        await refreshTransactions();
        addToast('Recorrência configurada!', 'success');
        onCancel();
        return;
      }

      // Case 3: Standard
      const newTransaction: Transaction = {
        id: initialData?.id || uuidv4(),
        type,
        value: valueRaw,
        category,
        date,
        description: description || undefined,
        tags: tagsArray,
        accountId
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
    smartInput, setSmartInput, isParsing, parsedPreview,
    showAdvanced, setShowAdvanced,
    repeatMode, setRepeatMode,
    frequency, setFrequency,
    installments, setInstallments,
    suggestedCategory, applySuggestion,
    accounts,
    currentCategories,
    handleSubmit
  };
};
