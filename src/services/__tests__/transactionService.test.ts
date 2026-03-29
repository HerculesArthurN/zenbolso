import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../db';
import { transactionService } from '../transactionService';

// Mock the dexie DB and crypto
vi.mock('../db', () => {
    return {
        db: {
            transactions: {
                orderBy: vi.fn(),
                put: vi.fn(),
                get: vi.fn(),
                delete: vi.fn()
            }
        }
    };
});

vi.mock('../../utils/crypto', () => ({
    encrypt: vi.fn((val) => `encrypted_${val}`),
    decrypt: vi.fn((val) => {
        if (typeof val === 'string' && val.startsWith('encrypted_')) {
            return val.replace('encrypted_', '');
        }
        return val;
    })
}));

describe('transactionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch transactions and decrypt values', async () => {
        const mockArray = vi.fn().mockResolvedValue([
            { id: '1', type: 'EXPENSE', value: 'encrypted_100', description: 'encrypted_Test', date: '2023-01-01', category: 'Food', accountId: 'acc1' }
        ]);
        const mockLimit = vi.fn().mockReturnValue({ toArray: mockArray });
        const mockReverse = vi.fn().mockReturnValue({ limit: mockLimit });
        (db.transactions.orderBy as any).mockReturnValue({ reverse: mockReverse });

        const result = await transactionService.fetchTransactions(10);

        expect(db.transactions.orderBy).toHaveBeenCalledWith('date');
        expect(mockLimit).toHaveBeenCalledWith(10);
        expect(result).toHaveLength(1);
        expect(result[0].amount).toBe(100);
        expect(result[0].description).toBe('Test');
    });

    it('should create a transaction with encrypted payload', async () => {
        (db.transactions.put as any).mockResolvedValue('123');

        const result = await transactionService.createTransaction({
            amount: 50,
            description: 'New Transaction',
            type: 'INCOME',
            date: '2023-01-02'
        });

        expect(db.transactions.put).toHaveBeenCalledWith(expect.objectContaining({
            value: 'encrypted_50',
            description: 'encrypted_New Transaction',
            type: 'INCOME'
        }));
        expect(result.amount).toBe(50);
        expect(result.id).toBeDefined();
    });

    it('should update a transaction and encrypt partial fields', async () => {
        (db.transactions.get as any).mockResolvedValue({
            id: '1', type: 'EXPENSE', value: 'encrypted_100', description: 'encrypted_Old', date: '2023-01-01', category: 'Food', accountId: 'acc1'
        });

        const result = await transactionService.updateTransaction('1', { amount: 200 });

        expect(db.transactions.put).toHaveBeenCalledWith(expect.objectContaining({
            id: '1',
            value: 'encrypted_200'
        }));
        expect(result.amount).toBe(200);
        expect(result.description).toBe('Old');
    });

    it('should delete a transaction', async () => {
        await transactionService.deleteTransaction('1');
        expect(db.transactions.delete).toHaveBeenCalledWith('1');
    });
});
