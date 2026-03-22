import { useState, useCallback, useEffect } from 'react';
import { TransactionType } from '../types';
import { transactionService } from '../services/transactionService';
import { z } from 'zod';

export interface TransactionFormData {
  amount: number;
  description: string;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  date: string;
}

const initialFormData: TransactionFormData = {
  amount: 0,
  description: '',
  type: 'EXPENSE',
  categoryId: '',
  accountId: '',
  date: new Date().toISOString().split('T')[0],
};

const transactionSchema = z.object({
  amount: z.number().positive('O valor deve ser maior que zero'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER']),
  categoryId: z.string().min(1, 'A categoria é obrigatória'),
  accountId: z.string().min(1, 'A conta é obrigatória'),
  date: z.string().min(10, 'A data é obrigatória'),
});

export interface UseTransactionFormOptions {
  initialData?: any;
  accounts?: any[];
  onSuccess?: () => void;
}

export const useTransactionForm = (options?: UseTransactionFormOptions) => {
  const { initialData, accounts = [], onSuccess } = options || {};

  const [formData, setFormData] = useState<TransactionFormData>(() => {
    if (initialData) {
      return {
        amount: initialData.amount,
        description: initialData.description || '',
        type: initialData.type === 'TRANSFER' ? 'EXPENSE' : initialData.type,
        categoryId: initialData.category_id || '',
        accountId: initialData.account_id || (accounts.length > 0 ? accounts[0].id : ''),
        date: initialData.date,
      };
    }
    return {
      ...initialFormData,
      accountId: accounts.length > 0 ? accounts[0].id : '',
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof TransactionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Remove error when user starts typing
    setErrors(prev => {
      if (!prev[field]) return prev;
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Sync accountId fallback if accounts load later
  useEffect(() => {
    if (accounts.length > 0 && !formData.accountId && !initialData) {
      setFormData(prev => ({ ...prev, accountId: accounts[0].id }));
    }
  }, [accounts, formData.accountId, initialData]);

  const validate = (): boolean => {
    const result = transactionSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const submitTransaction = async (): Promise<boolean> => {
    if (!validate()) return false;

    setIsSubmitting(true);
    try {
      const payload = {
        amount: formData.amount,
        description: formData.description,
        type: formData.type,
        category_id: formData.categoryId,
        account_id: formData.accountId,
        date: formData.date,
        user_id: 'local',
        is_paid: true,
      };

      if (initialData) {
        await transactionService.updateTransaction((initialData as any).id, payload as any);
      } else {
        await transactionService.createTransaction({
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any);
      }

      setFormData(initialFormData);
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error submitting transaction:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    submitTransaction,
  };
};
