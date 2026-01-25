import { useTranslation } from 'react-i18next';
import { useProfileSettings } from './useProfileSettings';

/**
 * Custom hook for locale-aware number and date formatting
 * CRITICAL: Currency is decoupled from locale to prevent financial inaccuracy
 * - Locale controls formatting rules (decimal separators, date format)
 * - Currency is determined by user's financial profile (mainCurrency)
 */
export const useLocaleFormat = () => {
    const { i18n } = useTranslation();
    const { profile } = useProfileSettings();

    // Map i18n language codes to Intl locale codes
    const getLocale = (): string => {
        const localeMap: Record<string, string> = {
            'pt-BR': 'pt-BR',
            'en-US': 'en-US',
            'es-ES': 'es-ES',
            'zh-CN': 'zh-CN',
            'ja-JP': 'ja-JP',
            'ko-KR': 'ko-KR',
            'fr-FR': 'fr-FR',
            'de-DE': 'de-DE',
        };
        return localeMap[i18n.language] || 'pt-BR';
    };

    /**
     * Get user's preferred currency from profile
     * This is independent of UI language to prevent financial confusion
     */
    const getCurrency = (): string => {
        return profile.mainCurrency || 'BRL';
    };

    /**
     * Format currency based on current locale formatting rules
     * but using the user's actual currency
     * 
     * Examples:
     * - Locale: en-US, Currency: BRL -> "R$ 1,000.00" (US format, BRL symbol)
     * - Locale: pt-BR, Currency: USD -> "US$ 1.000,00" (BR format, USD symbol)
     */
    const formatCurrency = (value: number, options?: Intl.NumberFormatOptions): string => {
        return new Intl.NumberFormat(getLocale(), {
            style: 'currency',
            currency: getCurrency(),
            ...options,
        }).format(value);
    };

    /**
     * Format currency in compact notation (e.g., R$ 1,2 mil)
     */
    const formatCurrencyCompact = (value: number): string => {
        return new Intl.NumberFormat(getLocale(), {
            style: 'currency',
            currency: getCurrency(),
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(value);
    };

    /**
     * Format number based on current locale
     */
    const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
        return new Intl.NumberFormat(getLocale(), options).format(value);
    };

    /**
     * Format date based on current locale
     */
    const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(getLocale(), options).format(dateObj);
    };

    /**
     * Format date in short format (e.g., 19/01/2026)
     */
    const formatDateShort = (date: Date | string): string => {
        return formatDate(date, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    /**
     * Format date in medium format (e.g., 19 de jan. de 2026)
     */
    const formatDateMedium = (date: Date | string): string => {
        return formatDate(date, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    /**
     * Format date in long format (e.g., 19 de janeiro de 2026)
     */
    const formatDateLong = (date: Date | string): string => {
        return formatDate(date, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    /**
     * Format relative time (e.g., "2 days ago", "in 3 hours")
     */
    const formatRelativeTime = (date: Date | string): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

        const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });

        if (Math.abs(diffInSeconds) < 60) {
            return rtf.format(-diffInSeconds, 'second');
        } else if (Math.abs(diffInSeconds) < 3600) {
            return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
        } else if (Math.abs(diffInSeconds) < 86400) {
            return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
        } else if (Math.abs(diffInSeconds) < 2592000) {
            return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
        } else if (Math.abs(diffInSeconds) < 31536000) {
            return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
        } else {
            return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
        }
    };

    return {
        formatCurrency,
        formatCurrencyCompact,
        formatNumber,
        formatDate,
        formatDateShort,
        formatDateMedium,
        formatDateLong,
        formatRelativeTime,
        locale: getLocale(),
        currency: getCurrency(),
    };
};
