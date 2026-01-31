import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DailyForecast } from '../../services/forecast';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '../../src/hooks/useLocaleFormat';

interface ForecastWidgetProps {
  data: DailyForecast[];
}

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ data }) => {
  const { t } = useTranslation();
  const { formatCurrency, formatCurrencyCompact } = useLocaleFormat();

  if (data.length === 0) return null;

  // Sanitize data to prevent NaN
  const safeData = data.map(d => ({
    ...d,
    balance: Number(d.balance) || 0
  }));

  const startBalance = safeData[0].balance;
  const endBalance = safeData[safeData.length - 1].balance;
  const diff = endBalance - startBalance;
  const isPositive = diff >= 0;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden text-left">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {t('planning.simulate_purchase')} (30 Dias)
            <span className="text-[10px] font-normal bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">Beta</span>
          </h3>
          <p className="text-xs text-gray-500">{t('dashboard.subtitle')}</p>
        </div>
        <div className={`text-right ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          <div className="flex items-center justify-end gap-1 font-bold text-lg">
            {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {formatCurrency(diff, { notation: 'compact' })}
          </div>
          <p className="text-[10px] text-gray-400 uppercase font-medium">Projeção</p>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={safeData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.2} />
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0} />
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
              tickFormatter={formatCurrencyCompact}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                borderRadius: '12px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [formatCurrency(value), t('sidebar.current_balance')]}
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