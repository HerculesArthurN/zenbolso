import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../db';
import { accountService } from '../accountService';

// Mock the dexie DB and crypto
vi.mock('../db', () => ({
    db: {
        accounts: {
            toArray: vi.fn(),
            add: vi.fn(),
            get: vi.fn(),
            put: vi.fn(),
            delete: vi.fn()
        },
        transactions: {
            toArray: vi.fn(),
            where: vi.fn(() => ({
                equals: vi.fn(() => ({
                    count: vi.fn()
                }))
            }))
        }
    }
}));

vi.mock('../../utils/crypto', () => ({
    decrypt: vi.fn((val) => val)
}));

describe('accountService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should map legacy types correctly', () => {
        expect(accountService.mapLegacyType('CHECKING')).toBe('BANK');
        expect(accountService.mapLegacyType('CASH')).toBe('WALLET');
        expect(accountService.mapLegacyType('INVESTMENT')).toBe('INVESTMENT');
        expect(accountService.mapLegacyType('UNKNOWN')).toBe('BANK');
    });

    it('should create an account and map defaults', async () => {
        (db.accounts.add as any).mockResolvedValue('acc1');

        const result = await accountService.createAccount({
            name: 'NuBank',
            balance: 1000,
            color: '#333'
        });

        expect(db.accounts.add).toHaveBeenCalledWith(expect.objectContaining({
            name: 'NuBank',
            initialBalance: 1000,
            type: 'checking',
            color: '#333'
        }));
        expect(result.id).toBeDefined();
        expect(result.name).toBe('NuBank');
        expect(result.balance).toBe(1000);
        expect(result.type).toBe('BANK');
    });

    it('should calculate account balance from transactions', async () => {
        (db.accounts.toArray as any).mockResolvedValue([
            { id: 'acc1', name: 'Wallet', initialBalance: 500, type: 'CASH', color: '#000' }
        ]);
        
        // Income of 200, Expense of 50
        (db.transactions.toArray as any).mockResolvedValue([
            { accountId: 'acc1', type: 'INCOME', value: 200 },
            { accountId: 'acc1', type: 'EXPENSE', value: 50 },
            { accountId: 'acc2', type: 'INCOME', value: 1000 } // Unrelated
        ]);

        const results = await accountService.fetchAccounts();
        
        expect(results).toHaveLength(1);
        expect(results[0].balance).toBe(500 + 200 - 50); // 650
    });

    it('should update an account', async () => {
        (db.accounts.get as any).mockResolvedValue({
            id: 'acc1', name: 'Wallet', initialBalance: 500, type: 'CASH', color: '#000'
        });

        const result = await accountService.updateAccount('acc1', { name: 'New Wallet', balance: 800 });

        expect(db.accounts.put).toHaveBeenCalledWith(expect.objectContaining({
            id: 'acc1',
            name: 'New Wallet',
            initialBalance: 800
        }));
        expect(result.balance).toBe(800);
        expect(result.name).toBe('New Wallet');
    });

    it('should delete account if no transactions exist', async () => {
        const mockCount = vi.fn().mockResolvedValue(0);
        (db.transactions.where as any) = vi.fn().mockReturnValue({
            equals: vi.fn().mockReturnValue({
                count: mockCount
            })
        });

        await accountService.deleteAccount('acc1');
        
        expect(db.accounts.delete).toHaveBeenCalledWith('acc1');
    });

    it('should throw error when deleting account with transactions', async () => {
        const mockCount = vi.fn().mockResolvedValue(5);
        (db.transactions.where as any) = vi.fn().mockReturnValue({
            equals: vi.fn().mockReturnValue({
                count: mockCount
            })
        });

        await expect(accountService.deleteAccount('acc1')).rejects.toThrow('HAS_DATA');
        expect(db.accounts.delete).not.toHaveBeenCalled();
    });
});
