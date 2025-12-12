import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DailyForecast } from '../../services/forecast';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ForecastWidgetProps {
  data: DailyForecast[];
}

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ data }) => {
  if (data.length === 0) return null;

  const startBalance = data[0].balance;
  const endBalance = data[data.length - 1].balance;
  const diff = endBalance - startBalance;
  const isPositive = diff >= 0;

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
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Projeção (30 Dias)
                <span className="text-[10px] font-normal bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">Beta</span>
            </h3>
            <p className="text-xs text-gray-500">Baseado nas transações recorrentes</p>
        </div>
        <div className={`text-right ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
             <div className="flex items-center justify-end gap-1 font-bold text-lg">
                {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                {formatCurrency(diff)}
             </div>
             <p className="text-[10px] text-gray-400 uppercase font-medium">Variação Prevista</p>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-10" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 10 }} 
              interval={6}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                borderColor: 'var(--border)', 
                borderRadius: '12px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [fullCurrency(value), "Saldo Previsto"]}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke={isPositive ? "#10b981" : "#f43f5e"} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorBalance)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};