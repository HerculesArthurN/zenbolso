import React, { useState, useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useCategories } from '../hooks/useCategories';
import { ExpensePieChart } from '../components/reports/ExpensePieChart';
import { MonthlyFlowChart } from '../components/reports/MonthlyFlowChart';
import { ChevronLeft, ChevronRight, Calendar, PieChart as PieIcon, BarChart3, Download } from 'lucide-react';

export const ReportsPage: React.FC = () => {
    const { transactions, loading: loadingTxs } = useDashboardData();
    const { categories, loading: loadingCats } = useCategories();

    // Month state: 0 for Jan, 11 for Dec
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const monthLabel = useMemo(() => {
        return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }, [currentDate]);

    const filteredTransactions = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        return transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() === month;
        });
    }, [transactions, currentDate]);

    const stats = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0);

        // Group by category for accessibility fallback
        const catMap: Record<string, number> = {};
        filteredTransactions
            .filter(t => t.type === 'EXPENSE')
            .forEach(t => {
                const cat = categories.find(c => c.id === t.category_id);
                const name = cat ? cat.name : 'Sem categoria';
                catMap[name] = (catMap[name] || 0) + t.amount;
            });

        const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

        return { income, expense, balance: income - expense, categoryData };
    }, [filteredTransactions, categories]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 text-left">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Relatórios Mensais</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Sua vida financeira em gráficos.</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-4 font-bold text-slate-800 dark:text-white min-w-[150px] justify-center capitalize">
                        <Calendar size={16} className="text-indigo-500" />
                        {monthLabel}
                    </div>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </header>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Entradas</p>
                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(stats.income)}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Saídas</p>
                    <p className="text-2xl font-black text-rose-500">{formatCurrency(stats.expense)}</p>
                </div>
                <div className="bg-indigo-600 p-6 rounded-[32px] shadow-xl shadow-indigo-500/20 text-white">
                    <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1">Saldo do Mês</p>
                    <p className="text-2xl font-black">{formatCurrency(stats.balance)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expense by Category */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <PieIcon size={20} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Gastos por Categoria</h3>
                        </div>
                    </div>

                    {(loadingTxs || loadingCats) ? (
                        <div className="h-80 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <ExpensePieChart
                            transactions={filteredTransactions}
                            categories={categories}
                        />
                    )}
                </div>

                {/* Monthly Flow */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <BarChart3 size={20} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Fluxo Mensal</h3>
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                            <Download size={14} /> Exportar
                        </button>
                    </div>

                    {(loadingTxs) ? (
                        <div className="h-80 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <MonthlyFlowChart transactions={filteredTransactions} />
                    )}
                </div>
            </div>

            <div className="p-8 bg-slate-900 dark:bg-indigo-950 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-500/20">
                <div className="text-center md:text-left">
                    <h4 className="text-xl font-bold mb-1">Deseja um relatório completo?</h4>
                    <p className="text-indigo-200 text-sm">Exporte seus dados em CSV ou PDF para uma análise offline profunda.</p>
                </div>
                <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all active:scale-95 shadow-lg">
                    Gerar PDF Completo
                </button>
            </div>

            {/* === ACCESSIBILITY (SCREEN READERS ONLY) === */}
            <div className="sr-only">
                <h2>Resumo detalhado de {monthLabel}</h2>

                {/* Flow Table (Income vs Expense) */}
                <table>
                    <caption>Comparativo de Entradas e Saídas</caption>
                    <thead>
                        <tr>
                            <th scope="col">Tipo</th>
                            <th scope="col">Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Receitas</td>
                            <td>{formatCurrency(stats.income)}</td>
                        </tr>
                        <tr>
                            <td>Despesas</td>
                            <td>{formatCurrency(stats.expense)}</td>
                        </tr>
                        <tr>
                            <td>Saldo Líquido</td>
                            <td>{formatCurrency(stats.balance)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Category Breakdown */}
                <h3>Detalhamento por Categoria (Gastos)</h3>
                <ul>
                    {stats.categoryData.map((item: any) => (
                        <li key={item.name}>
                            {item.name}: {formatCurrency(item.value)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
