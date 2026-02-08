import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction, Category } from '../../types';
import { safeNumber } from '../../utils/numberUtils';

interface ExpensePieChartProps {
    transactions: Transaction[];
    categories: Category[];
}

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ transactions, categories }) => {
    const data = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'EXPENSE');
        const grouped = expenses.reduce((acc, t) => {
            const catId = t.category_id || 'unnamed';
            acc[catId] = (acc[catId] || 0) + safeNumber(t.amount, 0);
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([catId, amount]) => {
            const cat = categories.find(c => c.id === catId);
            return {
                name: cat?.name || 'Sem categoria',
                value: amount,
                color: cat?.color || '#94a3b8'
            };
        }).sort((a, b) => b.value - a.value);
    }, [transactions, categories]);

    if (data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium">Sem despesas registradas</p>
                <p className="text-[10px] opacity-60">Adicione transações para ver o gráfico.</p>
            </div>
        );
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#fff',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: '11px', fontWeight: '600' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
