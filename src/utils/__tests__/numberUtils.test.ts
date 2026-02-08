import { describe, it, expect } from 'vitest';
import {
    safeNumber,
    safeDivide,
    safePercentage,
    safeSum,
    safeAverage,
    safeClamp
} from '../numberUtils';

describe('numberUtils - NaN Eradication', () => {
    describe('safeNumber', () => {
        it('should return 0 for null', () => {
            expect(safeNumber(null)).toBe(0);
        });

        it('should return 0 for undefined', () => {
            expect(safeNumber(undefined)).toBe(0);
        });

        it('should return 0 for NaN', () => {
            expect(safeNumber(NaN)).toBe(0);
        });

        it('should return 0 for Infinity', () => {
            expect(safeNumber(Infinity)).toBe(0);
        });

        it('should return 0 for -Infinity', () => {
            expect(safeNumber(-Infinity)).toBe(0);
        });

        it('should parse valid string numbers', () => {
            expect(safeNumber('123')).toBe(123);
            expect(safeNumber('123.45')).toBe(123.45);
        });

        it('should return 0 for invalid strings', () => {
            expect(safeNumber('abc')).toBe(0);
            expect(safeNumber('')).toBe(0);
        });

        it('should return the number for valid numbers', () => {
            expect(safeNumber(42)).toBe(42);
            expect(safeNumber(-10)).toBe(-10);
            expect(safeNumber(0)).toBe(0);
        });

        it('should use custom fallback', () => {
            expect(safeNumber(null, 100)).toBe(100);
            expect(safeNumber(undefined, -1)).toBe(-1);
        });
    });

    describe('safeDivide', () => {
        it('should return 0 when dividing by zero', () => {
            expect(safeDivide(10, 0)).toBe(0);
        });

        it('should return 0 when dividing by null', () => {
            expect(safeDivide(10, null)).toBe(0);
        });

        it('should perform valid division', () => {
            expect(safeDivide(10, 2)).toBe(5);
            expect(safeDivide(100, 4)).toBe(25);
        });

        it('should use custom fallback for division by zero', () => {
            expect(safeDivide(10, 0, -1)).toBe(-1);
        });

        it('should sanitize numerator', () => {
            expect(safeDivide(null, 2)).toBe(0);
            expect(safeDivide(undefined, 2)).toBe(0);
        });
    });

    describe('safePercentage', () => {
        it('should calculate percentage correctly', () => {
            expect(safePercentage(25, 100)).toBe(25);
            expect(safePercentage(50, 200)).toBe(25);
        });

        it('should return 0 when whole is zero', () => {
            expect(safePercentage(10, 0)).toBe(0);
        });

        it('should handle null/undefined', () => {
            expect(safePercentage(null, 100)).toBe(0);
            expect(safePercentage(50, null)).toBe(0);
        });

        it('should use custom fallback', () => {
            expect(safePercentage(10, 0, 100)).toBe(100);
        });
    });

    describe('safeSum', () => {
        it('should sum valid numbers', () => {
            expect(safeSum([1, 2, 3])).toBe(6);
            expect(safeSum([10, 20, 30])).toBe(60);
        });

        it('should return 0 for empty array', () => {
            expect(safeSum([])).toBe(0);
        });

        it('should skip null/undefined values', () => {
            expect(safeSum([1, null, 3])).toBe(4);
            expect(safeSum([1, undefined, 3])).toBe(4);
        });

        it('should handle mixed types', () => {
            expect(safeSum([1, '2', 3])).toBe(6);
            expect(safeSum([1, 'abc', 3])).toBe(4);
        });

        it('should handle NaN values', () => {
            expect(safeSum([1, NaN, 3])).toBe(4);
        });
    });

    describe('safeAverage', () => {
        it('should calculate average correctly', () => {
            expect(safeAverage([1, 2, 3])).toBe(2);
            expect(safeAverage([10, 20, 30])).toBe(20);
        });

        it('should return 0 for empty array', () => {
            expect(safeAverage([])).toBe(0);
        });

        it('should skip null/undefined values', () => {
            expect(safeAverage([2, null, 4])).toBe(3);
        });

        it('should use custom fallback for empty array', () => {
            expect(safeAverage([], 100)).toBe(100);
        });
    });

    describe('safeClamp', () => {
        it('should clamp value within range', () => {
            expect(safeClamp(50, 0, 100)).toBe(50);
            expect(safeClamp(-10, 0, 100)).toBe(0);
            expect(safeClamp(150, 0, 100)).toBe(100);
        });

        it('should handle null/undefined', () => {
            expect(safeClamp(null, 0, 100)).toBe(0);
            expect(safeClamp(undefined, 10, 20)).toBe(10);
        });
    });

    describe('Real-world scenarios', () => {
        it('should handle account balance calculation', () => {
            const accounts = [
                { balance: 1000 },
                { balance: null },
                { balance: undefined },
                { balance: 500 }
            ];

            const total = accounts.reduce((sum, acc) => sum + safeNumber(acc.balance, 0), 0);
            expect(total).toBe(1500);
        });

        it('should handle transaction aggregation', () => {
            const transactions = [
                { amount: 100 },
                { amount: null },
                { amount: '50' },
                { amount: NaN }
            ];

            const total = transactions.reduce((sum, tx) => sum + safeNumber(tx.amount, 0), 0);
            expect(total).toBe(150);
        });

        it('should handle hourly rate calculation', () => {
            const monthlyIncome = 4000;
            const workHours = 160;
            const rate = safeDivide(monthlyIncome, workHours, 0);
            expect(rate).toBe(25);
        });

        it('should handle division by zero in hourly rate', () => {
            const monthlyIncome = 4000;
            const workHours = 0;
            const rate = safeDivide(monthlyIncome, workHours, 0);
            expect(rate).toBe(0); // Not Infinity!
        });

        it('should handle percentage with zero total', () => {
            const expenses = 100;
            const income = 0;
            const percent = safePercentage(expenses, income, 0);
            expect(percent).toBe(0); // Not Infinity!
        });
    });
});
