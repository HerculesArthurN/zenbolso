import { describe, it, expect } from 'vitest';
import { parseTransactionText } from '../smartParser';
import { Account, Category } from '../../types';
import { format, subDays } from 'date-fns';

describe('smartParser', () => {
    const mockAccounts: Account[] = [
        {
            id: '1',
            name: 'Nubank',
            balance: 0,
            color: 'purple',
            type: 'BANK',
            user_id: 'u1',
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];

    const mockCategories: Category[] = [
        {
            id: 'cat1',
            name: 'Alimentação',
            color: 'red',
            icon: 'utensils',
            type: 'EXPENSE',
            user_id: 'u1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'cat2',
            name: 'Salário',
            color: 'green',
            icon: 'dollar-sign',
            type: 'INCOME',
            user_id: 'u1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];

    it('should parse simple "Pizza 50"', () => {
        const result = parseTransactionText('Pizza 50', mockAccounts, mockCategories);
        expect(result.amount).toBe(50);
        expect(result.description).toBe('Pizza');
    });

    it('should parse complex "Salário 5000 Nubank ontem"', () => {
        const result = parseTransactionText('Salário 5000 Nubank ontem', mockAccounts, mockCategories);
        expect(result.amount).toBe(5000);
        // The parser maintains the account name if it helps describe the transaction
        expect(result.description).toContain('Salário');
        expect(result.account_id).toBe('1');
        expect(result.date).toBe(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
    });



    it('should parse edge case with currency symbol "R$ 1.200,50"', () => {
        const result = parseTransactionText('R$ 1.200,50', mockAccounts, mockCategories);
        // We expect it to handle Brazilian formatting if it's "Smart"
        // If it fails, we know where to improve.
        expect(result.amount).toBe(1200.5);
    });
});
