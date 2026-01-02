import { useState, useEffect } from 'react';
import { parseTransactionText, ParsedTransaction } from '../services/smartParser';
import { Account, Category } from '../types';

export const useSmartInput = (text: string, accounts: Account[], categories: Category[]) => {
    const [parsed, setParsed] = useState<ParsedTransaction | null>(null);

    useEffect(() => {
        if (!text.trim()) {
            setParsed(null);
            return;
        }

        const timer = setTimeout(() => {
            const result = parseTransactionText(text, accounts, categories);
            setParsed(result);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [text, accounts, categories]);

    return parsed;
};
