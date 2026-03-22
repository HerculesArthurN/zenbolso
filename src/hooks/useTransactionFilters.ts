import { useState, useCallback } from 'react';
import * as datePresets from '../utils/datePresets';
import { TransactionType } from '../types';

export interface TransactionFiltersState {
    startDate: Date;
    endDate: Date;
    type?: TransactionType;
    categoryId?: string;
}

export const useTransactionFilters = () => {
    const [filters, setFilters] = useState<TransactionFiltersState>(() => {
        const { startDate, endDate } = datePresets.getCurrentMonth();
        return { startDate, endDate };
    });

    const setFilter = useCallback((key: keyof TransactionFiltersState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const applyDatePreset = useCallback((preset: datePresets.DatePreset) => {
        let dates;
        switch (preset) {
            case 'LAST_7_DAYS':
                dates = datePresets.getLast7Days();
                break;
            case 'LAST_30_DAYS':
                dates = datePresets.getLast30Days();
                break;
            case 'CURRENT_MONTH':
            default:
                dates = datePresets.getCurrentMonth();
                break;
        }
        setFilters(prev => ({ ...prev, startDate: dates.startDate, endDate: dates.endDate }));
    }, []);

    const clearFilters = useCallback(() => {
        const { startDate, endDate } = datePresets.getCurrentMonth();
        setFilters({ startDate, endDate });
    }, []);

    return {
        filters,
        setFilter,
        applyDatePreset,
        clearFilters
    };
};
