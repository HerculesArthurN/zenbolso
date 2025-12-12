import React, { useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { CategorySummary } from '../../types';
import { LayoutGrid } from 'lucide-react';

interface ExpensesTreemapProps {
  data: CategorySummary[];
}

// Custom Content Renderer for the Treemap Blocks
const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name, value } = props;

  // Formatting helper inside the loop
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(val);

  // If it's the root node, don't render
  if (depth === 1) {
      // Logic to determine if text fits
      const showText = width > 60 && height > 40;
      const showValue = width > 80 && height > 60;
      const fontSize = Math.min(width / 8, 14);

      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: payload.color || '#334155',
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
              {name}
            </text>
          )}
          {showText && showValue && (
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
  }
  return null;
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

export const ExpensesTreemap: React.FC<ExpensesTreemapProps> = ({ data }) => {
  
  // Prepare data for Treemap (Recharts expects a 'children' structure)
  const treeData = useMemo(() => {
    // Filter only expenses and sort by value (biggest blocks first)
    const expenses = data
        .filter(c => c.total > 0) // Categories usually mix types in summary, but summary data comes pre-aggregated. We rely on the color/context or assume passed data is correct. 
        // NOTE: In App.tsx we pass `dynamicCategories` which are expenses only.
        .map(c => ({
            name: c.category,
            size: c.total,
            color: c.color,
            percentage: c.percentage,
            icon: c.icon
        }))
        .sort((a, b) => b.size - a.size);

    return [{
        name: 'Despesas',
        children: expenses
    }];
  }, [data]);

  if (data.length === 0) return null;

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