import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Plus, Target, Settings, Wallet } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useSummaryQuery } from '../../hooks/useFinanceData';

export const Sidebar: React.FC = () => {
  const { openTransactionModal } = useData();
  const { data: summary } = useSummaryQuery();
  const location = useLocation();

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(val);

  const getLinkClass = (path: string) => {
     const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
     return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`;
  };

  return (
    <div className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50">
      
      {/* Header / Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-primary text-white p-1.5 rounded-lg shadow-sm">
            <Wallet size={20} />
        </div>
        <span className="font-bold text-slate-900 dark:text-white tracking-tight">Gerente Pessoal</span>
      </div>

      {/* Quick Summary Widget */}
      <div className="px-6 py-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 uppercase font-medium mb-1">Saldo Atual</p>
            <p className={`text-xl font-bold ${!summary || summary.netBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                {summary ? formatCurrency(summary.netBalance) : '...'}
            </p>
          </div>
          
          <button
            onClick={() => openTransactionModal()}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-medium shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
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
        <Link to="/settings" className={getLinkClass('/settings')}>
            <Settings size={20} /> Configurações
        </Link>
      </nav>

      <div className="p-6 text-xs text-slate-400 text-center">
          v1.3.0 • React Query
      </div>
    </div>
  );
};