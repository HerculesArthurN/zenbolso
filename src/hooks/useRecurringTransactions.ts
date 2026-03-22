import { useState, useCallback, useEffect } from 'react';
import { recurringService } from '../services/recurringService';
import { RecurringTransaction } from '../types';

export const useRecurringTransactions = () => {
    const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await recurringService.getRecurring();
            setTransactions(data);
        } catch (error) {
            console.error('Failed to load recurring transactions', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const addTransaction = async (rule: Partial<RecurringTransaction>) => {
        try {
            const newTx = await recurringService.addRecurring(rule);
            setTransactions(prev => [...prev, newTx]);
            return newTx;
        } catch (error) {
            console.error('Failed to add recurring transaction', error);
            throw error;
        }
    };

    const cancelTransaction = async (id: string) => {
        const previousState = [...transactions];
        setTransactions(prev => prev.filter(t => t.id !== id));
        try {
            await recurringService.deleteRecurring(id);
        } catch (error) {
            setTransactions(previousState);
            console.error('Failed to cancel recurring transaction', error);
            throw error;
        }
    };

    const toggleTransaction = async (rule: RecurringTransaction) => {
        setTransactions(prev => prev.map(t => t.id === rule.id ? { ...t, active: !t.active } : t));
        try {
            await recurringService.toggleActive(rule.id, !rule.active);
        } catch (error) {
            setTransactions(prev => prev.map(t => t.id === rule.id ? { ...t, active: rule.active } : t));
            console.error('Failed to toggle recurring transaction', error);
            throw error;
        }
    };

    return {
        transactions,
        isLoading,
        addTransaction,
        cancelTransaction,
        toggleTransaction,
        refresh: loadTransactions
    };
};
