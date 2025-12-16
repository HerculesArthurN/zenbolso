import { TransactionType } from '../../../types';

export interface ParserContext {
    categories: Array<{ id: string; name: string; type: TransactionType }>;
    accounts: Array<{ id: string; name: string }>;
}

export interface TransactionDraft {
    value?: number;
    date?: string; // YYYY-MM-DD
    description?: string;
    categoryId?: string;
    categoryName?: string;
    accountId?: string;
    accountName?: string;
    type?: TransactionType;
    confidence: number; // 0 a 1
}

export interface ParserStrategy {
    parse(text: string, context: ParserContext, currentDraft: TransactionDraft): {
        draft: TransactionDraft;
        remainingText: string;
    };
}