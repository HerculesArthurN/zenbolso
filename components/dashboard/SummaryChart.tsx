import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { CategorySummary } from '../../types';
import { PieChart as PieIcon, Circle } from 'lucide-react';

interface SummaryChartProps {
  data: CategorySummary[];
}

// Custom Active Shape for the hover effect
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // Expands 6px
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="transition-all duration-300 ease-out"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius - 2}
        fill={fill}
        fillOpacity={0.4}
      />
    </g>
  );
};

export const SummaryChart: React.FC<SummaryChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // 1. Logic: Group small categories (< 3%) into "Outros"
  const processedData = useMemo(() => {
    if (data.length === 0) return [];

    const totalValue = data.reduce((acc, cur) => acc + cur.total, 0);
    const threshold = totalValue * 0.03; // 3%

    const majorCategories: any[] = [];
    let othersTotal = 0;

    data.forEach(item => {
      if (item.total >= threshold) {
        majorCategories.push(item);
      } else {
        othersTotal += item.total;
      }
    });

    if (othersTotal > 0) {
      majorCategories.push({
        category: 'Outros',
        total: othersTotal,
        percentage: (othersTotal / totalValue) * 100,
        color: '#94a3b8', // Slate-400 for neutral
        icon: '📦'
      });
    }

    return majorCategories;
  }, [data]);

  const totalValue = useMemo(() => data.reduce((acc, cur) => acc + cur.total, 0), [data]);

  // Determine what to show in the center
  const activeItem = activeIndex >= 0 ? processedData[activeIndex] : null;
  const centerLabel = activeItem ? activeItem.category : 'Total';
  const centerValue = activeItem ? activeItem.total : totalValue;
  const centerIcon = activeItem ? (activeItem.icon || '🏷️') : '💰';

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  if (data.length === 0) {
    return (
      <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
        <PieIcon size={48} className="opacity-20 mb-2" />
        <p className="text-sm">Sem dados para exibir</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <PieIcon size={20} className="text-emerald-500" />
            Distribuição
        </h3>
      </div>

      <div className="relative flex-1 min-h-[250px]">
        {/* Center Information Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-2xl mb-1 filter drop-shadow-sm">{centerIcon}</span>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{centerLabel}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(centerValue)}
            </p>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={2}
              dataKey="total"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              stroke="none"
            >
              {processedData.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="outline-none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {processedData.slice(0, 6).map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${activeIndex === idx ? 'bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                  <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-gray-600 dark:text-gray-300">{item.category}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white ml-2">
                      {Math.round(item.percentage)}%
                  </span>
              </div>
          ))}
      </div>
    </div>
  );
};