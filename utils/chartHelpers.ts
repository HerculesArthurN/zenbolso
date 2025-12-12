import { Transaction } from '../types';

export const CHART_COLORS = ['#00897B', '#D97706', '#F43F5E', '#10B981', '#6366F1', '#64748B'];

export interface ChartDataPoint {
  name: string;
  value: number;
  percentage: number;
  color: string;
  icon?: string;
}

export const formatCurrency = (val: number, compact: boolean = false) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  }).format(val);
};

export const groupExpensesByCategory = (transactions: Transaction[]): ChartDataPoint[] => {
  if (!transactions || transactions.length === 0) return [];

  const totals: Record<string, number> = {};
  let totalExpense = 0;

  // 1. Agrupar e Somar
  transactions.forEach((t) => {
    if (t.type === 'expense') {
      const cat = t.category || 'Outros';
      totals[cat] = (totals[cat] || 0) + t.value;
      totalExpense += t.value;
    }
  });

  if (totalExpense === 0) return [];

  // 2. Transformar em Array, Calcular Porcentagem e Ordenar
  return Object.entries(totals)
    .map(([name, value], index) => ({
      name,
      value,
      percentage: (value / totalExpense) * 100,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value); // Maior para o menor
};
