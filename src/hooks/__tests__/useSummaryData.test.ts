import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSummaryData } from '../useSummaryData';
import { Account, Transaction } from '../../types';

describe('useSummaryData Hook', () => {
    it('deve calcular corretamente o saldo total, receitas e despesas do mês', () => {
        const mockAccounts: Account[] = [
            {
                id: 'acc-1',
                user_id: 'user-1',
                name: 'Carteira',
                balance: 1000,
                type: 'WALLET',
                color: 'blue',
                is_archived: false,
                created_at: '',
                updated_at: ''
            },
            {
                id: 'acc-2',
                user_id: 'user-1',
                name: 'Banco',
                balance: 2500,
                type: 'BANK',
                color: 'green',
                is_archived: false,
                created_at: '',
                updated_at: ''
            },
            {
                id: 'acc-3',
                user_id: 'user-1',
                name: 'Inv',
                balance: undefined as any,
                type: 'INVESTMENT',
                color: 'red',
                is_archived: false,
                created_at: '',
                updated_at: ''
            }
        ];

        const currentDate = new Date();
        const currentMonthIso = currentDate.toISOString();

        const pastDate = new Date();
        pastDate.setMonth(pastDate.getMonth() - 2);
        const pastMonthIso = pastDate.toISOString();

        const mockTransactions: Transaction[] = [
            {
                id: 't-1',
                user_id: 'user-1',
                account_id: 'acc-1',
                category_id: null,
                amount: 500,
                description: 'Salário',
                date: currentMonthIso,
                type: 'INCOME',
                is_paid: true,
                created_at: '',
                updated_at: ''
            },
            {
                id: 't-2',
                user_id: 'user-1',
                account_id: 'acc-1',
                category_id: null,
                amount: 200,
                description: 'Mercado',
                date: currentMonthIso,
                type: 'EXPENSE',
                is_paid: true,
                created_at: '',
                updated_at: ''
            },
            {
                id: 't-3',
                user_id: 'user-1',
                account_id: 'acc-1',
                category_id: null,
                amount: 1500,
                description: 'Freelance antigo',
                date: pastMonthIso,
                type: 'INCOME',
                is_paid: true,
                created_at: '',
                updated_at: ''
            },
            {
                id: 't-4',
                user_id: 'user-1',
                account_id: 'acc-1',
                category_id: null,
                amount: null as any,
                description: 'Mercado antigo',
                date: currentMonthIso,
                type: 'EXPENSE',
                is_paid: true,
                created_at: '',
                updated_at: ''
            }
        ];

        const { result } = renderHook(() =>
            useSummaryData({ accounts: mockAccounts, transactions: mockTransactions })
        );

        expect(result.current.totalBalance).toBe(3500);
        expect(result.current.monthIncome).toBe(500);
        expect(result.current.monthExpense).toBe(200);
    });
});
