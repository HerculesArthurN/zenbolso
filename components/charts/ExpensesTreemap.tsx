import React, { useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { Transaction } from '../../types';
import { groupExpensesByCategory, formatCurrency } from '../../utils/chartHelpers';
import { LayoutGrid } from 'lucide-react';

interface ExpensesTreemapProps {
  transactions: Transaction[];
}

const CustomContent = (props: any) => {
  const { x, y, width, height, index, payload, name, value } = props;

  // Lógica de visualização: só mostra texto se o bloco for grande o suficiente
  const showText = width > 50 && height > 35;
  const showValue = width > 70 && height > 55;
  const fontSize = Math.min(width / 7, 13);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: payload.color || '#64748B',
          stroke: 'transparent',
        }}
        rx={10}
        ry={10}
        className="opacity-90 hover:opacity-100 transition-opacity duration-300 cursor-default"
      />
      {showText && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showValue ? 7 : 0)}
          textAnchor="middle"
          fill="#fff"
          fontSize={fontSize}
          fontWeight={600}
          className="pointer-events-none drop-shadow-sm"
        >
          {name}
        </text>
      )}
      {showText && showValue && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 9}
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize={fontSize * 0.85}
          className="pointer-events-none"
        >
          {formatCurrency(value, true)}
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50">
        <p className="font-bold text-slate-900 dark:text-white mb-1">{data.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {formatCurrency(data.value)}
        </p>
        <p className="text-xs text-primary mt-1 font-medium">
          {data.percentage.toFixed(1)}% do total
        </p>
      </div>
    );
  }
  return null;
};

export const ExpensesTreemap: React.FC<ExpensesTreemapProps> = ({ transactions }) => {
  const data = useMemo(() => {
    const categories = groupExpensesByCategory(transactions);
    // O Recharts Treemap exige um nó raiz único com children
    return [{
      name: 'Despesas',
      children: categories
    }];
  }, [transactions]);

  if (!transactions.some(t => t.type === 'expense')) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutGrid size={20} className="text-secondary" />
          Mapa de Gastos
        </h3>
        <span className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
          Área = Valor
        </span>
      </div>

      <div className="flex-1 w-full rounded-2xl overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="value"
            stroke="#fff"
            fill="#8884d8"
            content={<CustomContent />}
            animationDuration={800}
            aspectRatio={4/3}
          >
            <Tooltip content={<CustomTooltip />} cursor={false} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
