import React from 'react';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { Outlet } from 'react-router-dom';

import { useData } from '../../contexts/DataContext';
import { useAccountsQuery } from '../../hooks/useFinanceData';
import { NewTransactionModal } from '../transactions/NewTransactionModal';

export const AppLayout: React.FC = () => {
  const { isTransactionModalOpen, closeTransactionModal, transactionToEdit, refreshData } = useData();
  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccountsQuery();

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 transition-colors duration-300">

      {/* Desktop layout: sidebar + main content (≥ md) */}
      <div className="hidden md:flex h-screen overflow-hidden">
        <DesktopSidebar />
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          <div className="max-w-6xl mx-auto px-8 py-8 animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile layout: bottom nav + scrollable content (< md) */}
      <div className="md:hidden">
        <main className="pb-24 min-h-[100vh]">
          <div className="w-full px-2 sm:px-4 py-6 animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>

      <NewTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        accounts={accounts}
        isLoadingAccounts={isLoadingAccounts}
        initialData={transactionToEdit}
        onSuccess={refreshData}
      />
    </div>
  );
};