import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    RefreshCcw,
    Wallet,
    PieChart,
    Settings,
    LogOut
} from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

interface SidebarProps {
    isMobile?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Início', path: '/dashboard' },
        { icon: RefreshCcw, label: 'Fixos', path: '/recurring' },
        { icon: Wallet, label: 'Contas', path: '/transactions' },
        { icon: PieChart, label: 'Dados', path: '/reports' },
    ];

    const sidebarClasses = isMobile
        ? "fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out"
        : "hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800";

    return (
        <>
            {/* Backdrop for Mobile */}
            {isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={sidebarClasses}>
                <div className="p-6 flex items-center gap-3">
                    <BrandLogo variant="color" className="w-8 h-8" />
                    <span className="text-xl font-black tracking-tighter italic">
                        <span className="text-slate-900 dark:text-white">ZEN</span>
                        <span className="text-emerald-500">BOLSO</span>
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={isMobile ? onClose : undefined}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold
                                ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                            `}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
                    <NavLink
                        to="/settings"
                        onClick={isMobile ? onClose : undefined}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                            ${isActive
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}
                        `}
                    >
                        <Settings size={20} />
                        Configurações
                    </NavLink>
                </div>
            </aside>
        </>
    );
};
