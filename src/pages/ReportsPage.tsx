import React, { useState, useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useCategories } from '../hooks/useCategories';
import { ExpensePieChart } from '../components/reports/ExpensePieChart';
import { MonthlyFlowChart } from '../components/reports/MonthlyFlowChart';
import { ChevronLeft, ChevronRight, Calendar, PieChart as PieIcon, BarChart3, Download, Settings, FileText } from 'lucide-react';
import { useLocaleFormat } from '../hooks/useLocaleFormat';
import { SyncStatus } from '../components/common/SyncStatus';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../contexts/ToastContext';
import { safeNumber } from '../utils/numberUtils';

export const ReportsPage: React.FC = () => {
    const { addToast } = useToast();
    const { formatCurrency, formatDate } = useLocaleFormat();
    const { accounts, transactions, loading: loadingTxs } = useDashboardData();
    const { categories, loading: loadingCats } = useCategories();
    const reportRef = React.useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Month state: 0 for Jan, 11 for Dec
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const monthLabel = useMemo(() => {
        return formatDate(currentDate, { month: 'long', year: 'numeric' });
    }, [currentDate, formatDate]);

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
            .reduce((sum, t) => sum + safeNumber(t.amount, 0), 0);
        const expense = filteredTransactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + safeNumber(t.amount, 0), 0);

        // Group by category for accessibility fallback
        const catMap: Record<string, number> = {};
        filteredTransactions
            .filter(tx => tx.type === 'EXPENSE')
            .forEach(tx => {
                const cat = categories.find(c => c.id === tx.category_id);
                const name = cat ? cat.name : 'Sem descrição';
                catMap[name] = (catMap[name] || 0) + safeNumber(tx.amount, 0);
            });

        const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

        return { income, expense, balance: income - expense, categoryData };
    }, [filteredTransactions, categories]);

    const handleExportPDF = async () => {
        if (!reportRef.current) return;

        setIsExporting(true);
        addToast('Gerando PDF...', 'info');

        try {
            const element = reportRef.current;
            // Temporarily hide elements with "no-print" class
            const noPrintElements = element.querySelectorAll('.no-print');
            noPrintElements.forEach(el => (el as HTMLElement).style.display = 'none');

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Restore visibility
            noPrintElements.forEach(el => (el as HTMLElement).style.display = '');

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`relatorio-${monthLabel.replace(/\s/g, '-')}.pdf`);

            addToast('PDF gerado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            addToast('Erro ao gerar PDF. Tente novamente.', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div ref={reportRef} className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 text-left bg-white dark:bg-slate-950 p-4 md:p-8 rounded-[48px]">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Relatórios
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Acompanhe suas finanças detalhadamente
                    </p>
                </div>

                <div className="md:hidden flex items-center justify-between w-full bg-white dark:bg-slate-900 p-4 pl-16 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm no-print">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Saldo Atual
                        </span>
                        <span className={`text-xl font-black leading-none ${accounts.reduce((acc, a) => acc + safeNumber(a.balance, 0), 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatCurrency(accounts.reduce((acc, a) => acc + safeNumber(a.balance, 0), 0))}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <SyncStatus />
                        <Link
                            to="/settings"
                            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                            aria-label="Configurações"
                        >
                            <Settings size={20} />
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:block no-print">
                        <SyncStatus />
                    </div>
                    <div className="flex items-center bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors no-print"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 px-4 font-bold text-slate-800 dark:text-white min-w-[150px] justify-center capitalize">
                            <Calendar size={16} className="text-indigo-500" />
                            {monthLabel}
                        </div>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors no-print"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Receitas</p>
                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(stats.income)}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Despesas</p>
                    <p className="text-2xl font-black text-rose-500">{formatCurrency(stats.expense)}</p>
                </div>
                <div className="bg-indigo-600 p-6 rounded-[32px] shadow-xl shadow-indigo-500/20 text-white">
                    <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1">Saldo Atual</p>
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
                            <h3 className="font-bold text-slate-900 dark:text-white">Distribuição</h3>
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
                            <h3 className="font-bold text-slate-900 dark:text-white">Evolução</h3>
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors no-print">
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

            {/* PDF Export Section */}
            <div className="p-8 bg-slate-900 dark:bg-indigo-950 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-500/20 no-print">
                <div className="text-center md:text-left">
                    <h4 className="text-xl font-bold mb-1">Exportar Relatório</h4>
                    <p className="text-indigo-200 text-sm">Gere um documento PDF completo do seu desempenho mensal.</p>
                </div>
                <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all active:scale-95 shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                    {isExporting ? (
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <FileText size={20} />
                    )}
                    Confirmar PDF
                </button>
            </div>
        </div>
    );
};
