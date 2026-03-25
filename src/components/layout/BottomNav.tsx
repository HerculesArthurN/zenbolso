import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Repeat, Settings, Plus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export const BottomNav: React.FC = () => {
    const { openTransactionModal } = useData() as any;

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Início' },
        { path: '/transactions', icon: Receipt, label: 'Lançamentos' },
        { path: '/recurring', icon: Repeat, label: 'Assinaturas' },
        { path: '/settings', icon: Settings, label: 'Ajustes' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-50 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] transition-colors">
            <div className="flex items-center justify-between px-2 h-16">
                {/* Left Side Items */}
                <div className="flex flex-1 justify-around">
                    {navItems.slice(0, 2).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-14 gap-1 transition-all duration-300 ${
                                    isActive
                                        ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`
                            }
                        >
                            <item.icon size={22} strokeWidth={2.5} />
                            <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                {/* Center FAB (Floating Action Button) */}
                <div className="relative -top-6 mx-2">
                    <button
                        onClick={() => openTransactionModal(undefined)}
                        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 active:scale-90 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-600/30 transition-all border-[6px] border-slate-50 dark:border-slate-950"
                        aria-label="Nova Transação"
                    >
                        <Plus size={28} strokeWidth={3} />
                    </button>
                </div>

                {/* Right Side Items */}
                <div className="flex flex-1 justify-around">
                    {navItems.slice(2, 4).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-14 gap-1 transition-all duration-300 ${
                                    isActive
                                        ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`
                            }
                        >
                            <item.icon size={22} strokeWidth={2.5} />
                            <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};