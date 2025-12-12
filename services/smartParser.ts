import { Category, Account, TransactionType } from '../types';
import Fuse from 'fuse.js';

export interface ParsedTransaction {
  value?: number;
  category?: string;
  accountId?: string;
  type?: TransactionType;
  date?: string;
  description?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: 'weekly' | 'monthly' | 'yearly';
}

// Palavras-chave para recorrência
const RECURRENCE_KEYWORDS = {
  monthly: ['mensal', 'mensalmente', 'todo mês', 'toda mes', 'repetir mês'],
  weekly: ['semanal', 'semanalmente', 'toda semana', 'toda segunda', 'toda sexta'],
  yearly: ['anual', 'anualmente', 'todo ano']
};

const sanitizeInput = (str: string): string => {
  return str.replace(/[<>]/g, '').trim();
};

export const parseSmartInput = (
  input: string, 
  categories: Category[], 
  accounts: Account[]
): ParsedTransaction => {
  const result: ParsedTransaction = {};
  let textToProcess = sanitizeInput(input);

  // 1. Extração de Valor (Regex)
  // Suporta: R$ 50,00 | 50.00 | 50,90 | 50
  const valueRegex = /(?:R\$|€|\$)?\s?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)\b/;
  const valueMatch = textToProcess.match(valueRegex);

  if (valueMatch) {
    let rawValue = valueMatch[1];
    
    // Normalização brasileira: troca vírgula por ponto se necessário
    if (rawValue.includes(',') && !rawValue.includes('.')) {
       rawValue = rawValue.replace(',', '.');
    } else if (rawValue.includes('.') && rawValue.includes(',')) {
       // Formato 1.000,00 -> remove ponto, troca virgula por ponto
       rawValue = rawValue.replace(/\./g, '').replace(',', '.');
    }

    const value = parseFloat(rawValue);
    if (!isNaN(value)) {
      result.value = value;
      // Remove o valor do texto para não interferir na descrição
      textToProcess = textToProcess.replace(valueMatch[0], '').trim();
    }
  }

  // 2. Detecção de Recorrência
  const lowerText = textToProcess.toLowerCase();
  
  for (const [freq, keywords] of Object.entries(RECURRENCE_KEYWORDS)) {
    if (keywords.some(k => lowerText.includes(k))) {
      result.isRecurring = true;
      result.recurrenceFrequency = freq as 'weekly' | 'monthly' | 'yearly';
      // Não removemos do texto pois pode fazer parte da "história" da descrição
      break; 
    }
  }

  // 3. Detecção de Data (Palavras-chave simples)
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

  // 4. Fuzzy Match para Contas
  if (accounts.length > 0) {
    const accountFuse = new Fuse(accounts, {
      keys: ['name'],
      threshold: 0.4, // Tolerância média
      includeScore: true
    });
    
    // Divide o texto em palavras para tentar match em tokens específicos
    // Isso evita falso positivo em frases longas, mas aqui faremos busca na string completa
    // para casar nomes compostos de conta (ex: "Nubank PJ")
    const accResult = accountFuse.search(textToProcess);
    
    if (accResult.length > 0) {
      // Pega o melhor match
      const bestMatch = accResult[0].item;
      result.accountId = bestMatch.id;
      
      // Tenta remover o nome da conta do texto
      const regexName = new RegExp(`\\b${bestMatch.name}\\b`, 'i');
      textToProcess = textToProcess.replace(regexName, '');
    }
  }

  // 5. Fuzzy Match para Categorias
  if (categories.length > 0) {
    const categoryFuse = new Fuse(categories, {
      keys: ['name'],
      threshold: 0.3, // Mais estrito para categoria
      includeScore: true
    });

    const catResult = categoryFuse.search(textToProcess);

    if (catResult.length > 0) {
      const bestMatch = catResult[0].item;
      result.category = bestMatch.name;
      result.type = bestMatch.type;
      
      const regexName = new RegExp(`\\b${bestMatch.name}\\b`, 'i');
      textToProcess = textToProcess.replace(regexName, '');
    }
  }

  // 6. Limpeza Final da Descrição
  // Remove preposições soltas e espaços extras
  let description = textToProcess
    .replace(/\s+/g, ' ')
    .replace(/^(no|na|em|de|do|da|para|com|via)\s+/i, '')
    .trim();

  // Capitalize
  if (description) {
    result.description = description.charAt(0).toUpperCase() + description.slice(1);
  } else {
    // Se sobrou vazio, mas temos categoria, usa a categoria como descrição
    result.description = result.category || 'Nova Transação';
  }

  return result;
};
