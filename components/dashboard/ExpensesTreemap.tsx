import React, { useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { Transaction } from '../../types';
import { groupExpensesByCategory } from '../../services/domain/statistics.service';
import { CATEGORY_ICONS } from '../../constants';
import { LayoutGrid } from 'lucide-react';

interface ExpensesTreemapProps {
  transactions: Transaction[];
}

// Custom Content Renderer for the Treemap Blocks
const CustomizedContent = (props: any) => {
  const { depth, x, y, width, height, payload, name, value } = props;

  // Safety check: if critical props are undefined, don't render
  if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
    return null;
  }

  // Formatting helper inside the loop
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(val);

  // If it's not a leaf node (depth 1), or if dimensions are too small, skip
  if (depth !== 1 || width < 1 || height < 1) {
    return null;
  }

  // Logic to determine if text fits
  const showText = width > 60 && height > 40;
  const showValue = width > 80 && height > 60;
  const fontSize = Math.min(width / 8, 14);

  const fillColor = payload?.color || '#334155';

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: fillColor,
          stroke: '#fff',
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
        rx={8}
        ry={8}
        className="transition-all duration-300 hover:opacity-90 cursor-default"
      />
      {showText && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showValue ? 8 : 0)}
          textAnchor="middle"
          fill="#fff"
          fontSize={fontSize}
          fontWeight={600}
          style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
        >
          {name || ''}
        </text>
      )}
      {showText && showValue && typeof value === 'number' && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize={fontSize * 0.85}
        >
          {formatCurrency(value)}
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
        <p className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <span>{data.icon || '📦'}</span>
          {data.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {data.percentage ? `${data.percentage.toFixed(1)}% do total` : ''}
        </p>
      </div>
    );
  }
  return null;
};

export const ExpensesTreemap: React.FC<ExpensesTreemapProps> = ({ transactions }) => {

  // Prepare data for Treemap (Recharts expects a 'children' structure)
  const treeData = useMemo(() => {
    // Group expenses using the service
    const dataPoints = groupExpensesByCategory(transactions);

    const expenses = dataPoints.map(point => ({
      name: point.name,
      size: point.value, // value becomes size for Treemap
      color: point.color,
      percentage: point.percentage,
      icon: CATEGORY_ICONS[point.name as keyof typeof CATEGORY_ICONS] || '📦'
    }));

    return [{
      name: 'Despesas',
      children: expenses
    }];
  }, [transactions]);

  if (treeData[0].children.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <LayoutGrid size={20} className="text-indigo-500" />
          Mapa de Gastos
        </h3>
        <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
          Tamanho = Valor Gasto
        </span>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treeData}
            dataKey="size"
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent />}
            animationDuration={800}
          >
            <Tooltip content={<CustomTooltip />} cursor={false} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};