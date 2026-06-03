/**
 * Custom hook for locale-aware number and date formatting
 * HARDCODED: Portuguese (Brazil) - BRL
 */
export const useLocaleFormat = () => {
    /**
     * Format currency (always BRL/pt-BR style)
     */
    const formatCurrency = (value: number, options?: Intl.NumberFormatOptions): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            ...options,
        }).format(value / 100);
    };

    /**
     * Format currency in compact notation (e.g., R$ 1,2 mil)
     */
    const formatCurrencyCompact = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(value / 100);
    };

    /**
     * Format number based on pt-BR
     */
    const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
        return new Intl.NumberFormat('pt-BR', options).format(value);
    };

    /**
     * Format date based on pt-BR
     */
    const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
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
     * Format relative time (e.g., "há 2 dias", "em 3 horas")
     */
    const formatRelativeTime = (date: Date | string): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

        const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

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
        locale: 'pt-BR',
        currency: 'BRL',
    };
};

