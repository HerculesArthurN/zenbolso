import Fuse from 'fuse.js';
import { addDays, subDays, format } from 'date-fns';
import { ParserContext, ParserStrategy, TransactionDraft } from './types';

// --- STRATEGY 1: REGEX (Valor e Datas) ---

const sanitizeCurrency = (val: string): number => {
    // Remove R$, espaços e caracteres estranhos
    let clean = val.replace(/[^\d.,-]/g, '');

    // Caso brasileiro: 1.200,50 -> remove ponto, troca vírgula por ponto
    if (clean.includes(',') && clean.includes('.')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
    }
    // Caso apenas vírgula: 50,00 -> 50.00
    else if (clean.includes(',')) {
        clean = clean.replace(',', '.');
    }

    return parseFloat(clean);
};

const RegexParserStrategy: ParserStrategy = {
    parse(text, _, draft) {
        let remaining = text;
        const updates: Partial<TransactionDraft> = {};

        // 1. Extração de Valor (Suporta: 50 | 50,00 | 1.000,00 | R$ 50)
        const valueRegex = /(?:R\$|€|\$)?\s?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)\b/i;
        const valueMatch = remaining.match(valueRegex);

        if (valueMatch) {
            const rawValue = valueMatch[1];
            const parsedValue = sanitizeCurrency(rawValue);

            if (!isNaN(parsedValue)) {
                updates.value = parsedValue;
                // Remove o valor encontrado da string original
                remaining = remaining.replace(valueMatch[0], '').trim();
            }
        }

        // 2. Extração de Datas Simples
        const today = new Date();
        const lowerText = remaining.toLowerCase();

        if (lowerText.includes('hoje')) {
            updates.date = format(today, 'yyyy-MM-dd');
            remaining = remaining.replace(/hoje/i, '');
        } else if (lowerText.includes('ontem')) {
            updates.date = format(subDays(today, 1), 'yyyy-MM-dd');
            remaining = remaining.replace(/ontem/i, '');
        } else if (lowerText.includes('amanhã') || lowerText.includes('amanha')) {
            updates.date = format(addDays(today, 1), 'yyyy-MM-dd');
            remaining = remaining.replace(/amanhã|amanha/i, '');
        } else if (lowerText.includes('anteontem')) {
            updates.date = format(subDays(today, 2), 'yyyy-MM-dd');
            remaining = remaining.replace(/anteontem/i, '');
        } else {
            // Tenta capturar DD/MM
            const dateRegex = /\b(\d{1,2})\/(\d{1,2})\b/;
            const dateMatch = remaining.match(dateRegex);
            if (dateMatch) {
                const day = parseInt(dateMatch[1]);
                const month = parseInt(dateMatch[2]) - 1; // JS month 0-11
                const currentYear = today.getFullYear();
                const date = new Date(currentYear, month, day);
                updates.date = format(date, 'yyyy-MM-dd');
                remaining = remaining.replace(dateMatch[0], '');
            }
        }

        return {
            draft: { ...draft, ...updates },
            remainingText: remaining.trim()
        };
    }
};

// --- STRATEGY 2: FUZZY (Categorias e Contas) ---

const FuzzyParserStrategy: ParserStrategy = {
    parse(text, context, draft) {
        let remaining = text;
        const updates: Partial<TransactionDraft> = {};
        const threshold = 0.35; // Nível de tolerância do Fuse

        // 1. Match Accounts
        if (context.accounts.length > 0) {
            const accountFuse = new Fuse(context.accounts, {
                keys: ['name'],
                threshold,
                includeScore: true
            });

            // Busca na string completa
            const results = accountFuse.search(remaining);

            if (results.length > 0) {
                const bestMatch = results[0].item;
                updates.accountId = bestMatch.id;
                updates.accountName = bestMatch.name;

                // Remove o nome da conta do texto para limpar a descrição
                // Usamos regex com word boundary para evitar remover partes de palavras
                const regex = new RegExp(`\\b${bestMatch.name}\\b`, 'i');
                remaining = remaining.replace(regex, '').trim();
            }
        }

        // 2. Match Categories
        if (context.categories.length > 0) {
            const categoryFuse = new Fuse(context.categories, {
                keys: ['name'],
                threshold,
                includeScore: true
            });

            const results = categoryFuse.search(remaining);

            if (results.length > 0) {
                const bestMatch = results[0].item;
                updates.categoryId = bestMatch.id;
                updates.categoryName = bestMatch.name;
                updates.type = bestMatch.type; // Infere se é despesa/receita pela categoria

                const regex = new RegExp(`\\b${bestMatch.name}\\b`, 'i');
                remaining = remaining.replace(regex, '').trim();
            }
        }

        return {
            draft: { ...draft, ...updates },
            remainingText: remaining
        };
    }
};

// --- MAIN SERVICE ---

export const SmartParserService = {
    parse(input: string, context: ParserContext): TransactionDraft {
        let currentDraft: TransactionDraft = { confidence: 0 };
        let textToProcess = input;

        // 1. Pipeline de Estratégias
        // A ordem importa: Regex (valores exatos) -> Fuzzy (entidades) -> Sobra (Descrição)

        // Step A: Regex
        const regexResult = RegexParserStrategy.parse(textToProcess, context, currentDraft);
        currentDraft = regexResult.draft;
        textToProcess = regexResult.remainingText;

        // Step B: Fuzzy
        const fuzzyResult = FuzzyParserStrategy.parse(textToProcess, context, currentDraft);
        currentDraft = fuzzyResult.draft;
        textToProcess = fuzzyResult.remainingText;

        // 3. Limpeza Final para Descrição
        // Remove preposições comuns que sobraram (no, na, em, do, da)
        let finalDescription = textToProcess
            .replace(/\s+/g, ' ') // múltiplos espaços
            .replace(/\b(no|na|em|de|do|da|com|por|via)\b/gi, '')
            .trim();

        // Capitalize
        if (finalDescription.length > 0) {
            finalDescription = finalDescription.charAt(0).toUpperCase() + finalDescription.slice(1);
        } else if (currentDraft.categoryName) {
            // Se não sobrou descrição, usa a categoria como fallback
            finalDescription = currentDraft.categoryName;
        }

        currentDraft.description = finalDescription;

        // Cálculo de confiança simples
        let score = 0;
        if (currentDraft.value) score += 0.4;
        if (currentDraft.categoryId) score += 0.3;
        if (currentDraft.date) score += 0.2;
        if (currentDraft.description) score += 0.1;
        currentDraft.confidence = score;

        return currentDraft;
    }
};