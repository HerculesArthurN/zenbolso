import { TransactionType } from '../types';
import { ImportedDraft } from './importer';
import { v4 as uuidv4 } from 'uuid';
import { detectCategoryFromKeywords, formatDescription } from './categorizer';

// Interface da Estratégia
export interface ImportStrategy {
    name: string;
    canParse(line: string): boolean;
    parse(line: string): ImportedDraft | null;
}

const CLEAN_REGEX = /^(COMPRA|PAGAMENTO|TRANSFERÊNCIA|PIX)\s+/i;
const CURRENT_YEAR = new Date().getFullYear();

// --- Estratégia 1: Nubank ---
// Formato: DD MMM Descrição Valor (Ex: 12 OUT Uber *Eats 35,90)
export class NubankStrategy implements ImportStrategy {
    name = 'Nubank';
    // Regex: Dia (1-2 digitos), Mes (3 letras), Descrição (resto), Valor (digitos, virgula, 2 digitos)
    private regex = /^(\d{1,2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+(.+?)\s+(\d+[,.]\d{2})$/i;

    canParse(line: string): boolean {
        return this.regex.test(line.trim());
    }

    parse(line: string): ImportedDraft | null {
        const match = line.trim().match(this.regex);
        if (!match) return null;

        const day = match[1].padStart(2, '0');
        const monthStr = match[2].toUpperCase();
        const rawDesc = match[3];
        const valStr = match[4].replace('.', '').replace(',', '.');

        const monthMap: Record<string, string> = {
            'JAN': '01', 'FEV': '02', 'MAR': '03', 'ABR': '04', 'MAI': '05', 'JUN': '06',
            'JUL': '07', 'AGO': '08', 'SET': '09', 'OUT': '10', 'NOV': '11', 'DEZ': '12'
        };

        const desc = rawDesc.replace(CLEAN_REGEX, '').trim();
        const category = detectCategoryFromKeywords(desc);

        return {
            id: uuidv4(),
            date: `${CURRENT_YEAR}-${monthMap[monthStr]}-${day}`,
            description: formatDescription(desc),
            value: parseFloat(valStr),
            type: 'expense', // Nubank fatura é quase sempre despesa
            selected: true,
            category
        };
    }
}

// --- Estratégia 2: Genérica / Tabular ---
// Formato: DD/MM/YYYY Descrição R$ Valor (Ex: 12/10/2023 Padaria 12.50)
export class GenericStrategy implements ImportStrategy {
    name = 'Generic';
    private regex = /^(\d{2})\/(\d{2})(?:\/(\d{4}))?\s+(.+?)\s+(?:R\$\s?)?(-?\d+[.,]\d{2})$/i;

    canParse(line: string): boolean {
        return this.regex.test(line.trim());
    }

    parse(line: string): ImportedDraft | null {
        const match = line.trim().match(this.regex);
        if (!match) return null;

        const day = match[1];
        const month = match[2];
        const year = match[3] || CURRENT_YEAR;
        const rawDesc = match[4];
        const valStr = match[5].replace(',', '.');

        const desc = rawDesc.replace(CLEAN_REGEX, '').trim();
        let value = parseFloat(valStr);
        let type: TransactionType = 'expense';

        if (value < 0) {
            value = Math.abs(value);
            type = 'expense';
        } else if (desc.toLowerCase().includes('recebido') || desc.toLowerCase().includes('pagamento')) {
            type = 'income';
        }

        const category = detectCategoryFromKeywords(desc);

        return {
            id: uuidv4(),
            date: `${year}-${month}-${day}`,
            description: formatDescription(desc),
            value,
            type,
            selected: true,
            category: type === 'income' && category === 'Outros' ? 'Salário' : category
        };
    }
}