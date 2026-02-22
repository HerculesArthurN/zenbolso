import React from 'react';
import { MobileNav } from './MobileNav';
import { useData } from '../../contexts/DataContext';
import { Outlet } from 'react-router-dom';

interface AppLayoutProps {
  // No props needed for now
}

export const AppLayout: React.FC<AppLayoutProps> = () => {
  const { openTransactionModal } = useData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* Main Content Area - Strictly Mobile */}
      <main className="pb-24 min-h-screen">
        <div className="w-full px-4 sm:px-6 py-6 animate-in fade-in duration-300">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav onOpenTransactionModal={() => openTransactionModal()} />
    </div>
  );
};