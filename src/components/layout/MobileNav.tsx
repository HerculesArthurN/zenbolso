import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, RefreshCcw, Plus, Wallet, PieChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MobileNavProps {
    onOpenTransactionModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenTransactionModal }) => {
    const { t } = useTranslation();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface dark:bg-surface-dark border-t border-border-color dark:border-border-color-dark pb-safe">
            <div className="flex items-center justify-around h-16 px-2 relative">

                {/* Dashboard */}
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}
                >
                    <LayoutDashboard size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{t('sidebar.home')}</span>
                </NavLink>

                {/* Recurring */}
                <NavLink
                    to="/recurring"
                    className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}
                >
                    <RefreshCcw size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{t('sidebar.recurring')}</span>
                </NavLink>

                {/* FAB Center */}
                <div className="flex-1 flex justify-center -mt-8">
                    <button
                        onClick={onOpenTransactionModal}
                        className="w-14 h-14 bg-primary text-primary-fg dark:text-primary-fg-dark rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform border-4 border-background dark:border-background-dark"
                        aria-label={t('sidebar.new_transaction')}
                    >
                        <Plus size={28} />
                    </button>
                </div>

                {/* Transactions/Accounts */}
                <NavLink
                    to="/transactions"
                    className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}
                >
                    <Wallet size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{t('manage.accounts')}</span>
                </NavLink>

                {/* Reports */}
                <NavLink
                    to="/reports"
                    className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}
                >
                    <PieChart size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{t('sidebar.reports')}</span>
                </NavLink>

            </div>
        </div>
    );
};
