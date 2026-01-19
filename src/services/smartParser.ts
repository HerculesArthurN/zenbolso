import Fuse from 'fuse.js';
import { format, subDays } from 'date-fns';
import { Account, Category } from '../types';

export interface ParsedTransaction {
    amount?: number;
    description?: string;
    date?: string;
    account_id?: string;
    category_id?: string;
    type?: 'INCOME' | 'EXPENSE';
}

export const parseTransactionText = (
    text: string,
    accounts: Account[],
    categories: Category[]
): ParsedTransaction => {
    let workingText = text.toLowerCase();
    const result: ParsedTransaction = {
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'EXPENSE' // Default
    };

    // 1. EXTRACT AMOUNT
    // Patterns: 45.90, 45,90, r$ 45,90
    const amountRegex = /(?:r\$?\s*)?([\d.,]+)/i;
    const amountMatch = workingText.match(amountRegex);
    if (amountMatch) {
        let amountStr = amountMatch[1];
        // Handle BR format: 1.200,50 -> 1200.50
        if (amountStr.includes('.') && amountStr.includes(',')) {
            amountStr = amountStr.replace(/\./g, '').replace(',', '.');
        } else if (amountStr.includes(',')) {
            // Treat comma as decimal point
            amountStr = amountStr.replace(',', '.');
        } else if (amountStr.includes('.') && amountStr.split('.').pop()?.length !== 2) {
            // If dot is not followed by 2 digits, it might be a thousand separator (e.g. 1.200)
            // But let's simplify: in this app, we'll assume dot is decimal unless it's clearly thousand.
        }

        const parsedAmount = parseFloat(amountStr);
        if (!isNaN(parsedAmount)) {
            result.amount = parsedAmount;
            // Remove exact match from text
            workingText = workingText.replace(amountMatch[0], '').trim();
        }
    }

    // 2. EXTRACT DATE
    if (workingText.includes('ontem')) {
        result.date = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        workingText = workingText.replace('ontem', '').trim();
    } else if (workingText.includes('anteontem')) {
        result.date = format(subDays(new Date(), 2), 'yyyy-MM-dd');
        workingText = workingText.replace('anteontem', '').trim();
    } else if (workingText.includes('hoje')) {
        result.date = format(new Date(), 'yyyy-MM-dd');
        workingText = workingText.replace('hoje', '').trim();
    }

    // Clean extra words like "no", "na", "de"
    const stopWords = [' no ', ' na ', ' de ', ' com ', ' em ', ' para '];
    let entitySearchText = workingText;
    stopWords.forEach(word => {
        entitySearchText = entitySearchText.replace(word, ' ');
    });

    // 3. FUZZY MATCHING (Fuse.js)
    const fuseAccounts = new Fuse(accounts, { keys: ['name'], threshold: 0.4 });
    const fuseCategories = new Fuse(categories, { keys: ['name'], threshold: 0.4 });

    const accountMatches = fuseAccounts.search(entitySearchText);
    if (accountMatches.length > 0) {
        result.account_id = accountMatches[0].item.id;
    }

    const categoryMatches = fuseCategories.search(entitySearchText);
    if (categoryMatches.length > 0) {
        result.category_id = categoryMatches[0].item.id;
        result.type = categoryMatches[0].item.type;
    }

    // 4. DESCRIPTION (Cleaned remaining text)
    const words = workingText.split(/\s+/);
    const entitiesToRemove = [
        ...(accountMatches.length > 0 ? [accountMatches[0].item.name.toLowerCase()] : []),
        ...(categoryMatches.length > 0 ? [categoryMatches[0].item.name.toLowerCase()] : []),
        'no', 'na', 'de', 'com', 'em', 'para', // These are the stop words from the previous `entitySearchText` cleaning
        'ontem', 'anteontem', 'hoje'
    ];

    const remainingWords = words.filter(word => {
        const lowerWord = word.toLowerCase();
        return !entitiesToRemove.includes(lowerWord) && !lowerWord.match(amountRegex);
    });

    let finalDesc = remainingWords.join(' ').trim();

    if (finalDesc) {
        result.description = finalDesc.charAt(0).toUpperCase() + finalDesc.slice(1);
    } else if (categoryMatches.length > 0) {
        // Fallback to category name if description is empty
        result.description = categoryMatches[0].item.name;
    }


    return result;
};
