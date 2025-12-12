import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer, Cell } from 'recharts';
import { Transaction } from '../../types';
import { groupExpensesByCategory, formatCurrency } from '../../utils/chartHelpers';
import { PieChart as PieIcon } from 'lucide-react';

interface ExpensesDonutProps {
  transactions: Transaction[];
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      {/* Setor Principal Expandido */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="transition-all duration-300 drop-shadow-md"
      />
      {/* Anel Interno Decorativo */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 6}
        outerRadius={innerRadius - 4}
        fill={fill}
        fillOpacity={0.6}
      />
    </g>
  );
};

export const ExpensesDonut: React.FC<ExpensesDonutProps> = ({ transactions }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const data = useMemo(() => groupExpensesByCategory(transactions), [transactions]);
  const totalValue = useMemo(() => data.reduce((acc, cur) => acc + cur.value, 0), [data]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Determinar o que exibir no centro
  const activeItem = data[activeIndex] || data[0];
  const centerLabel = activeItem ? activeItem.name : 'Total';
  const centerValue = activeItem ? activeItem.value : totalValue;
  const centerPercent = activeItem ? activeItem.percentage : 100;

  if (data.length === 0) {
    return (
      <div className="h-[350px] flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
        <PieIcon size={48} className="opacity-20 mb-2" />
        <p className="text-sm">Sem despesas para exibir</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <PieIcon size={20} className="text-primary" />
        Distribuição
      </h3>

      <div className="relative flex-1 min-h-[250px]">
        {/* Overlay Central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 select-none">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{centerLabel}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(centerValue, true)}
          </p>
          <p className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1">
            {centerPercent.toFixed(1)}%
          </p>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={onPieEnter}
              stroke="none"
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda Customizada */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 max-h-24 overflow-y-auto custom-scrollbar">
        {data.map((entry, index) => (
          <div 
            key={entry.name}
            className={`flex items-center justify-between text-xs p-2 rounded-lg cursor-pointer transition-colors ${
              activeIndex === index ? 'bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[80px]">{entry.name}</span>
            </div>
            <span className="text-slate-900 dark:text-white font-semibold">{Math.round(entry.percentage)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
