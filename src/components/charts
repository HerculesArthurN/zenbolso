import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer, Cell } from 'recharts';
import { Transaction } from '../../types';
import { groupExpensesByCategory, formatCurrency } from '../../services/domain/statistics.service';
import { PieChart as PieIcon } from 'lucide-react';

interface ExpensesDonutProps {
  transactions: Transaction[];
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      {/* Setor Expandido */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8} // Expand
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="transition-all duration-300 drop-shadow-lg"
      />
      {/* Halo Interno */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 6}
        outerRadius={innerRadius - 3}
        fill={fill}
        fillOpacity={0.4}
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

  const activeItem = data[activeIndex] || data[0];
  const centerLabel = activeItem ? activeItem.name : 'Total';
  const centerValue = activeItem ? activeItem.value : totalValue;
  const centerPercent = activeItem ? activeItem.percentage : 100;

  if (data.length === 0) {
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
        <PieIcon size={48} className="opacity-20 mb-2" />
        <p className="text-sm">Sem despesas registradas</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <PieIcon size={20} className="text-primary" />
        Distribuição
      </h3>

      <div className="relative flex-1 min-h-[250px]">
        {/* Informações Centrais */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 select-none">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 max-w-[100px] truncate text-center">
            {centerLabel}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(centerValue, true)}
          </p>
          {activeItem && (
             <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
               {centerPercent.toFixed(1)}%
             </span>
          )}
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              {...{ activeIndex } as any}
              activeShape={renderActiveShape}
              data={data as any[]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={3}
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

      {/* Legenda Compacta */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center max-h-24 overflow-y-auto custom-scrollbar">
        {data.slice(0, 5).map((entry, index) => (
          <div 
            key={entry.name}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-colors border text-xs ${
              activeIndex === index 
                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};