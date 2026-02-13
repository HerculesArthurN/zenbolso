import React, { useState } from 'react';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from './MobileNav';
import { UserWidget } from './UserWidget';
import { useData } from '../../contexts/DataContext';
import { Menu } from 'lucide-react';
import { NewTransactionModal } from '../transactions/NewTransactionModal';
import { useDashboardData } from '../../hooks/useDashboardData';

interface AppLayoutProps {
    children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const {
        isTransactionModalOpen,
        openTransactionModal,
        closeTransactionModal,
        transactionToEdit
    } = useData();
    const { accounts, refresh, loading } = useDashboardData();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background dark:bg-background-dark text-text-main dark:text-text-main-dark transition-colors duration-300">

            {/* Desktop Sidebar (Always present on md+) */}
            <Sidebar />

            {/* Mobile Drawer Sidebar */}
            {isSidebarOpen && (
                <Sidebar isMobile onClose={() => setIsSidebarOpen(false)} />
            )}

            {/* Hamburger Button (Mobile only) */}
            <div className="md:hidden fixed top-4 left-4 z-40 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md p-2 rounded-xl border border-border-color dark:border-border-color-dark shadow-lg">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-text-main dark:text-text-main-dark"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Global User Widget (Mobile only) */}
            <div className="md:hidden fixed top-4 right-4 z-40">
                <div className="bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md p-1 rounded-full border border-border-color dark:border-border-color-dark shadow-lg">
                    <UserWidget mode="compact" />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="md:pl-64 pb-28 md:pb-8 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-300">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNav onOpenTransactionModal={() => openTransactionModal?.()} />

            {/* Global Transaction Modal */}
            <NewTransactionModal
                isOpen={isTransactionModalOpen}
                onClose={closeTransactionModal}
                accounts={accounts}
                isLoadingAccounts={loading}
                initialData={transactionToEdit}
                onSuccess={refresh}
            />
        </div>
    );
};
