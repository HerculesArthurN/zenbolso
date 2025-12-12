import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Plus, Target, Settings } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const BottomNav: React.FC = () => {
  const { openTransactionModal } = useData();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Início', icon: LayoutDashboard },
    { path: '/transactions', label: 'Extrato', icon: List },
    { path: 'FAB', label: 'Novo', icon: Plus }, // Placeholder for FAB
    { path: '/planning', label: 'Planos', icon: Target },
    { path: '/settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe md:hidden z-40">
      <div className="flex justify-around items-end h-16 relative">
        {navItems.map((item, index) => {
          if (item.path === 'FAB') {
            return (
              <div key={index} className="relative -top-6">
                <button
                  onClick={() => openTransactionModal()}
                  className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transform transition-transform hover:scale-105 active:scale-95 border-4 border-slate-50 dark:border-slate-900"
                  aria-label="Adicionar Transação"
                >
                  <Plus size={28} strokeWidth={2.5} />
                </button>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full pb-2 pt-1 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};