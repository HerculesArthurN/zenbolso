import { TransactionType } from '../types';
import { ImportStrategy, NubankStrategy, GenericStrategy } from './importStrategies';

export interface ImportedDraft {
  id: string;
  date: string;
  description: string;
  value: number;
  type: TransactionType;
  selected: boolean;
  category?: string;
}

// Registro de Estratégias disponíveis
// Para suportar um novo banco, basta adicionar a nova classe aqui.
const strategies: ImportStrategy[] = [
    new NubankStrategy(),
    new GenericStrategy()
];

export const parseBankText = (text: string): ImportedDraft[] => {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const drafts: ImportedDraft[] = [];

  lines.forEach(line => {
    // Tenta encontrar uma estratégia que aceite a linha
    const strategy = strategies.find(s => s.canParse(line));
    
    if (strategy) {
        const result = strategy.parse(line);
        if (result) {
            drafts.push(result);
        }
    }
  });

  return drafts;
};