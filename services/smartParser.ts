import { Category, Account, TransactionType } from '../types';
import { detectCategoryFromKeywords } from './categorizer';

export interface ParsedTransaction {
  value?: number;
  category?: string;
  accountId?: string;
  type?: TransactionType;
  date?: string;
  description?: string;
}

// Security: Sanitizador básico para remover tags HTML potenciais
const sanitizeInput = (str: string): string => {
  return str.replace(/[<>]/g, '');
};

export const parseSmartInput = (
  input: string, 
  categories: Category[], 
  accounts: Account[]
): ParsedTransaction => {
  const result: ParsedTransaction = {};
  // Security: Sanitiza o input imediatamente antes de qualquer processamento
  let textToProcess = sanitizeInput(input);

  // 1. Extract Value (Currency)
  // Matches: 50.50, 50,00, R$ 50, 50
  const valueRegex = /R?\$?\s?(\d+([.,]\d{1,2})?)/;
  const valueMatch = textToProcess.match(valueRegex);

  if (valueMatch) {
    const rawValue = valueMatch[1].replace(',', '.');
    const value = parseFloat(rawValue);
    if (!isNaN(value)) {
      result.value = value;
      // Remove value from text to avoid false positives in description
      textToProcess = textToProcess.replace(valueMatch[0], '').trim();
    }
  }

  // 2. Extract Date Keywords
  const lowerText = textToProcess.toLowerCase();
  const today = new Date();
  
  if (lowerText.includes('ontem')) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    result.date = d.toISOString().split('T')[0];
    textToProcess = textToProcess.replace(/ontem/i, '');
  } else if (lowerText.includes('amanhã') || lowerText.includes('amanha')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    result.date = d.toISOString().split('T')[0];
    textToProcess = textToProcess.replace(/amanhã|amanha/i, '');
  } else if (lowerText.includes('hoje')) {
    result.date = today.toISOString().split('T')[0];
    textToProcess = textToProcess.replace(/hoje/i, '');
  }

  // 3. Match Accounts (Explicit Name Match)
  // We sort by length descending to match "Nubank Platinum" before "Nubank"
  const sortedAccounts = [...accounts].sort((a, b) => b.name.length - a.name.length);
  for (const acc of sortedAccounts) {
    const accName = acc.name.toLowerCase();
    const regex = new RegExp(`\\b${accName}\\b`, 'i');
    if (regex.test(textToProcess)) {
      result.accountId = acc.id;
      textToProcess = textToProcess.replace(regex, '');
      break; 
    }
  }

  // 4. Match Categories (Explicit Name Match)
  const sortedCategories = [...categories].sort((a, b) => b.name.length - a.name.length);
  for (const cat of sortedCategories) {
    const catName = cat.name.toLowerCase();
    const regex = new RegExp(`\\b${catName}\\b`, 'i');
    
    if (regex.test(textToProcess)) {
      result.category = cat.name;
      result.type = cat.type; 
      textToProcess = textToProcess.replace(regex, '');
      break;
    }
  }

  // 5. Cleanup Description
  let description = textToProcess.replace(/\s+/g, ' ').trim();
  description = description.replace(/^(no|na|em|de|do|da|para)\s+/i, '');
  
  if (description) {
    result.description = description.charAt(0).toUpperCase() + description.slice(1);
    
    // 6. Intelligent Category Guess (Keyword Match)
    // If no explicit category was found, try to guess based on the remaining description
    if (!result.category) {
        const guessedCategory = detectCategoryFromKeywords(result.description);
        if (guessedCategory !== 'Outros') {
            result.category = guessedCategory;
            // Try to find the type of this guessed category from available categories list
            const matchedCat = categories.find(c => c.name === guessedCategory);
            if (matchedCat) {
                result.type = matchedCat.type;
            } else {
                // Default fallback if category name exists in keywords but not in user's list
                // We default to expense as most keywords are expenses
                result.type = 'expense';
            }
        }
    }
  }

  return result;
};