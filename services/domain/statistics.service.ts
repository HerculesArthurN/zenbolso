import { Transaction } from '../../types';

export const CHART_COLORS = ['#00897B', '#D97706', '#F43F5E', '#10B981', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'];

export interface ChartDataPoint {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

/**
 * Agrupa despesas por categoria, calcula percentuais e consolida itens pequenos (< 3%) em "Outros".
 */
export const groupExpensesByCategory = (transactions: Transaction[]): ChartDataPoint[] => {
  if (!transactions || transactions.length === 0) return [];

  // 1. Filtrar e Somar
  const totals: Record<string, number> = {};
  let totalExpense = 0;

  transactions.forEach((t) => {
    if (t.type === 'expense') {
      const cat = t.category || 'Outros';
      totals[cat] = (totals[cat] || 0) + t.value;
      totalExpense += t.value;
    }
  });

  if (totalExpense === 0) return [];

  // 2. Mapear para array e Ordenar
  let dataPoints: ChartDataPoint[] = Object.entries(totals)
    .map(([name, value]) => ({
      name,
      value,
      percentage: (value / totalExpense) * 100,
      color: '' // Será preenchido após agrupamento
    }))
    .sort((a, b) => b.value - a.value);

  // 3. Agrupar Categorias Pequenas (< 3%)
  const threshold = 3.0;
  const majorCategories: ChartDataPoint[] = [];
  let othersValue = 0;

  dataPoints.forEach(point => {
    if (point.percentage >= threshold) {
      majorCategories.push(point);
    } else {
      othersValue += point.value;
    }
  });

  // Adicionar "Outros" se houver
  if (othersValue > 0) {
    majorCategories.push({
      name: 'Outros',
      value: othersValue,
      percentage: (othersValue / totalExpense) * 100,
      color: '#94A3B8' // Slate-400
    });
  }

  // 4. Atribuir Cores da Paleta
  return majorCategories.map((point, index) => ({
    ...point,
    color: point.name === 'Outros' ? '#94A3B8' : CHART_COLORS[index % CHART_COLORS.length]
  }));
};

export const formatCurrency = (val: number, compact = false) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  }).format(val);
};
