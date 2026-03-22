import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay, format } from 'date-fns';

export type DatePreset = 'CURRENT_MONTH' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_WEEK' | 'THIS_YEAR' | 'CUSTOM';

export const getCurrentMonth = () => {
    const now = new Date();
    return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
    };
};

export const getLast7Days = () => {
    const now = new Date();
    return {
        startDate: startOfDay(subDays(now, 7)),
        endDate: endOfDay(now),
    };
};

export const getLast30Days = () => {
    const now = new Date();
    return {
        startDate: startOfDay(subDays(now, 30)),
        endDate: endOfDay(now),
    };
};

export const getPresetDates = (preset: DatePreset) => {
    switch (preset) {
        case 'LAST_7_DAYS':
            return getLast7Days();
        case 'LAST_30_DAYS':
            return getLast30Days();
        case 'CURRENT_MONTH':
        default:
            return getCurrentMonth();
    }
};

export const formatDateLocal = (date: Date) => format(date, 'yyyy-MM-dd');
