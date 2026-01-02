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
    const amountRegex = /(?:r\$?\s*)?(\d+(?:[.,]\d{2})?)/i;
    const amountMatch = workingText.match(amountRegex);
    if (amountMatch) {
        let amountStr = amountMatch[1].replace(',', '.');
        result.amount = parseFloat(amountStr);
        // Remove amount from text to avoid interference with description
        workingText = workingText.replace(amountMatch[0], '').trim();
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
        // Optional: remove matched account name from description
        workingText = workingText.replace(accountMatches[0].item.name.toLowerCase(), '').trim();
    }

    const categoryMatches = fuseCategories.search(entitySearchText);
    if (categoryMatches.length > 0) {
        result.category_id = categoryMatches[0].item.id;
        result.type = categoryMatches[0].item.type;
        // Optional: remove matched category name from description
        workingText = workingText.replace(categoryMatches[0].item.name.toLowerCase(), '').trim();
    }

    // 4. DESCRIPTION (Cleaned remaining text)
    // Remove multiple spaces and capitalize first letter
    const finalDesc = workingText
        .replace(/\s+/g, ' ')
        .trim();

    if (finalDesc) {
        result.description = finalDesc.charAt(0).toUpperCase() + finalDesc.slice(1);
    }

    return result;
};
