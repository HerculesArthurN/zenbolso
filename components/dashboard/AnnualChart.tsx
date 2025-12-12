import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MonthlySummary } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AnnualChartProps {
  data: MonthlySummary[];
  year: number;
  onYearChange: (year: number) => void;
}

export const AnnualChart: React.FC<AnnualChartProps> = ({ data, year, onYearChange }) => {
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);

  const fullCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Evolução Financeira</h3>
        
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button 
            onClick={() => onYearChange(year - 1)}
            className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-3 font-medium text-sm text-gray-900 dark:text-white select-none">{year}</span>
          <button 
            onClick={() => onYearChange(year + 1)}
            className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-10" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              dy={10}
              tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                borderColor: 'var(--border)', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: 'var(--text)'
              }}
              formatter={(value: number) => [fullCurrency(value)]}
              labelStyle={{ color: '#6B7280', marginBottom: '0.5rem' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
            />
            <Bar 
              name="Receitas" 
              dataKey="income" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]} 
              barSize={12}
            />
            <Bar 
              name="Despesas" 
              dataKey="expense" 
              fill="#F43F5E" 
              radius={[4, 4, 0, 0]} 
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Summary Footer */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 text-center">
         <div>
            <p className="text-xs text-gray-500 uppercase">Média Rec.</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                {formatCurrency(data.reduce((acc, cur) => acc + cur.income, 0) / 12)}
            </p>
         </div>
         <div>
            <p className="text-xs text-gray-500 uppercase">Média Desp.</p>
            <p className="font-semibold text-rose-600 dark:text-rose-400 text-sm">
                {formatCurrency(data.reduce((acc, cur) => acc + cur.expense, 0) / 12)}
            </p>
         </div>
         <div>
            <p className="text-xs text-gray-500 uppercase">Resumo Ano</p>
            <p className={`font-semibold text-sm ${
                data.reduce((acc, cur) => acc + cur.balance, 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
                {formatCurrency(data.reduce((acc, cur) => acc + cur.balance, 0))}
            </p>
         </div>
      </div>
    </div>
  );
};