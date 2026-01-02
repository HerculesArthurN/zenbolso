import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from '../../src/components/layout/MobileNav';
import { useData } from '../../context/DataContext';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { openTransactionModal } = useData();

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-text-main dark:text-text-main-dark transition-colors duration-300">

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="md:pl-64 pb-28 md:pb-8 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-300">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav onOpenTransactionModal={() => openTransactionModal()} />
    </div>
  );
};