
import { Transaction, TransactionType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from './errors';

// Helper puro para gerar a string CSV
export const exportToCSVString = (transactions: Transaction[]): string => {
  const headers = ['id', 'data', 'tipo', 'categoria_id', 'valor', 'descricao'];

  const sanitize = (val: string) => {
    if (!val) return '';
    // Security: Prevent CSV Injection
    if (/^[=+\-@]/.test(val)) {
      return `'${val}`;
    }
    return val.replace(/"/g, '""'); // Escape double quotes
  };

  return [
    headers.join(','),
    ...transactions.map(t => {
      const row = [
        t.id,
        t.date,
        t.type,
        `"${sanitize(t.category_id || '')}"`,
        t.amount.toFixed(2),
        `"${sanitize(t.description || '')}"`,
      ];
      return row.join(',');
    })
  ].join('\n');
};

export const exportToCSV = (transactions: Transaction[]) => {
  if (!transactions || transactions.length === 0) {
    throw new ValidationError('No transactions to export', 'EXPORT_NO_DATA');
  }

  const csvContent = exportToCSVString(transactions);

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `zenbolso_backup_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (csvText: string): Transaction[] => {
  if (!csvText || csvText.trim().length === 0) {
    throw new ValidationError('File is empty', 'IMPORT_EMPTY_FILE');
  }

  const lines = csvText.split('\n');
  const transactions: Transaction[] = [];

  // Skip header if present (basic heuristic)
  const startIndex = lines[0].toLowerCase().startsWith('id') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Basic CSV parsing handling quotes
    const matches = line.match(/".*?"|[^",\s]+(?=\s*,|\s*$)/g);
    const columns = matches || line.split(',');

    const clean = (val: string) => val ? val.replace(/^"|"$/g, '').replace(/""/g, '"') : '';

    try {
      const dateStr = clean(columns[1] || '');
      const typeStr = clean(columns[2] || '').toLowerCase();
      const categoryStr = clean(columns[3] || '');
      const valueStr = clean(columns[4] || '');

      if (!dateStr || !valueStr) continue;

      const val = parseFloat(valueStr);
      if (isNaN(val)) continue;

      const txType: TransactionType = (typeStr === 'receita' || typeStr === 'income') ? 'INCOME' : 'EXPENSE';

      const transaction: Transaction = {
        id: clean(columns[0]) || uuidv4(),
        user_id: '',
        date: dateStr,
        type: txType,
        category_id: categoryStr || null,
        amount: val,
        account_id: '',
        description: clean(columns[5] || '') || null,
        is_paid: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      transactions.push(transaction);
    } catch (e) {
      console.warn('Failed to parse line:', line, e);
    }
  }

  if (transactions.length === 0) {
    throw new ValidationError('Could not parse any transactions from CSV', 'IMPORT_NO_VALID_DATA');
  }

  return transactions;
};