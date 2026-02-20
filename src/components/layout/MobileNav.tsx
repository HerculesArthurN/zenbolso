import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, RefreshCcw, Plus, Wallet, PieChart } from 'lucide-react';

interface MobileNavProps {
    onOpenTransactionModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenTransactionModal }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe">
            <div className="flex items-center justify-around h-16 px-2 relative max-w-[430px] mx-auto">

                {/* Dashboard */}
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
                >
                    <LayoutDashboard size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Início</span>
                </NavLink>

                {/* Recurring */}
                <NavLink
                    to="/recurring"
                    className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
                >
                    <RefreshCcw size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Fixos</span>
                </NavLink>

                {/* FAB Center */}
                <div className="flex-1 flex justify-center -mt-8">
                    <button
                        onClick={onOpenTransactionModal}
                        className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/40 active:scale-95 transition-transform border-4 border-slate-50 dark:border-slate-900"
                        aria-label="Nova Transação"
                    >
                        <Plus size={28} />
                    </button>
                </div>

                {/* Transactions/Accounts */}
                <NavLink
                    to="/transactions"
                    className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
                >
                    <Wallet size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Contas</span>
                </NavLink>

                {/* Reports */}
                <NavLink
                    to="/reports"
                    className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
                >
                    <PieChart size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Dados</span>
                </NavLink>

            </div>
        </div>
    );
};
