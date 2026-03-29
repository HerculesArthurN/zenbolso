import { useState, useEffect, useCallback } from 'react';
import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import { Account, Transaction } from '../types';
import { useAuth } from '../contexts/SessionContext';

export const useDashboardData = () => {
    const auth = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [accs, txs] = await Promise.all([
                accountService.fetchAccounts(),
                transactionService.fetchTransactions(50)
            ]);

            setAccounts(accs);
            setTransactions(txs);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (auth.isLoading) {
            setLoading(true);
            return;
        }

        refresh();
    }, [auth.isLoading, refresh]);

    return { accounts, transactions, loading, error, refresh };
};
