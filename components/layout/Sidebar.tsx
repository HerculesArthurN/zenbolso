import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Plus, Target, Settings, RefreshCcw, PieChart } from 'lucide-react';
import { ThemeToggle } from '../../src/components/layout/ThemeToggle';
import { useData } from '../../context/DataContext';
import { useSummaryQuery } from '../../hooks/useFinanceData';
import { BrandLogo } from '../../src/components/ui/BrandLogo';

export const Sidebar: React.FC = () => {
  const { openTransactionModal } = useData();
  const { data: summary } = useSummaryQuery();
  const location = useLocation();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(val);

  const getLinkClass = (path: string) => {
    const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
      ? 'bg-primary/10 text-primary font-bold'
      : 'text-text-muted hover:bg-background dark:hover:bg-surface-dark'
      }`;
  };

  return (
    <div className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-surface dark:bg-surface-dark border-r border-border-color dark:border-border-color-dark z-50">

      {/* Header / Logo */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-border-color dark:border-border-color-dark">
        <BrandLogo className="h-10 w-10 p-1" variant="color" />
        <span className="font-extrabold text-xl text-text-main dark:text-text-main-dark tracking-tighter uppercase italic">
          Zen<span className="text-primary">Bolso</span>
        </span>
      </div>

      {/* Quick Summary Widget */}
      <div className="px-6 py-6">
        <div className="bg-background dark:bg-surface-dark/50 rounded-xl p-4 border border-border-color dark:border-border-color-dark">
          <p className="text-xs text-text-muted uppercase font-bold mb-1">Saldo Atual</p>
          <p className={`text-xl font-black ${!summary || summary.netBalance >= 0 ? 'text-text-main dark:text-text-main-dark' : 'text-danger'}`}>
            {summary ? formatCurrency(summary.netBalance) : '...'}
          </p>
        </div>

        <button
          onClick={() => openTransactionModal()}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-primary dark:bg-primary-dark text-primary-fg dark:text-primary-fg-dark py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <Plus size={18} /> Nova Transação
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <Link to="/" className={getLinkClass('/')}>
          <LayoutDashboard size={20} /> Início
        </Link>
        <Link to="/transactions" className={getLinkClass('/transactions')}>
          <List size={20} /> Extrato
        </Link>
        <Link to="/planning" className={getLinkClass('/planning')}>
          <Target size={20} /> Planejamento
        </Link>
        <Link to="/recurring" className={getLinkClass('/recurring')}>
          <RefreshCcw size={20} /> Recorrências
        </Link>
        <Link to="/reports" className={getLinkClass('/reports')}>
          <PieChart size={20} /> Relatórios
        </Link>
        <Link to="/settings" className={getLinkClass('/settings')}>
          <Settings size={20} /> Configurações
        </Link>
      </nav>

      <div className="p-6 flex items-center justify-between border-t border-border-color dark:border-border-color-dark">
        <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
          v1.3.0 • ZenBolso
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
};