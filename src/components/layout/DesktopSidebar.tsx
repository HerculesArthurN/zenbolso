import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    Repeat,
    Settings,
    Plus,
    Target,
    BarChart3,
    Wallet,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: Receipt, label: 'Lançamentos' },
    { path: '/planning', icon: Target, label: 'Planejamento' },
    { path: '/recurring', icon: Repeat, label: 'Recorrentes' },
    { path: '/reports', icon: BarChart3, label: 'Relatórios' },
    { path: '/settings', icon: Settings, label: 'Ajustes' },
];

export const DesktopSidebar: React.FC = () => {
    const { openTransactionModal } = useData() as any;

    return (
        <aside className="w-60 flex-shrink-0 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col">
            {/* Brand */}
            <div className="px-6 py-5 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                    <Wallet className="text-emerald-500" size={22} />
                    <span className="text-lg font-bold text-zinc-100 tracking-tight">ZenBolso</span>
                </div>
            </div>

            {/* Nova Transação CTA */}
            <div className="px-4 py-4">
                <button
                    onClick={() => openTransactionModal(undefined)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                    aria-label="Nova Transação"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    <span>Nova Transação</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-transparent'
                            }`
                        }
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 text-xs text-zinc-600">
                ZenBolso v1.3 · Local-First
            </div>
        </aside>
    );
};
