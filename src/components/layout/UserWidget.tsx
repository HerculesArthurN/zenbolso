import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    UserCircle,
    LogOut,
    Settings,
    ChevronUp,
    ChevronDown,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserWidgetProps {
    mode: 'compact' | 'expanded';
}

export const UserWidget: React.FC<UserWidgetProps> = ({ mode }) => {
    const { user, isAuthenticated, signOut } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Get initials or fallback
    const getInitials = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return '?';
    };

    const handleLogout = async () => {
        await signOut();
        setIsMenuOpen(false);
        navigate('/login');
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isAuthenticated) {
        return (
            <div className={mode === 'expanded' ? "px-4 mt-auto mb-4" : ""}>
                <button
                    onClick={() => navigate('/login')}
                    className={`
                        flex items-center gap-3 w-full transition-all duration-300
                        ${mode === 'expanded'
                            ? "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 p-4 rounded-2xl group"
                            : "p-2 bg-amber-500/20 rounded-full border border-amber-500/30"}
                    `}
                >
                    <div className={`
                        flex items-center justify-center rounded-full bg-amber-500 text-white shrink-0
                        ${mode === 'expanded' ? "w-10 h-10" : "w-8 h-8"}
                    `}>
                        <UserCircle size={mode === 'expanded' ? 24 : 20} />
                    </div>

                    {mode === 'expanded' && (
                        <div className="flex-1 text-left">
                            <p className="text-sm font-bold text-amber-700 dark:text-amber-400 leading-tight">
                                {t('auth.guest_mode', 'Modo Visitante')}
                            </p>
                            <p className="text-[10px] text-amber-600/70 dark:text-amber-500/60 font-medium">
                                {t('auth.not_synced', 'Dados não sincronizados')}
                            </p>
                        </div>
                    )}
                </button>
            </div>
        );
    }

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

    return (
        <div className={`relative ${mode === 'expanded' ? "px-4 mt-auto mb-4" : ""}`} ref={menuRef}>
            {/* Main Trigger Button */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`
                    flex items-center gap-3 w-full transition-all duration-300
                    ${mode === 'expanded'
                        ? "bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 p-3 rounded-2xl group"
                        : "p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full border border-indigo-500/20"}
                `}
            >
                {/* Avatar */}
                <div className={`
                    flex items-center justify-center rounded-full bg-indigo-600 text-white shrink-0 font-bold text-xs
                    ${mode === 'expanded' ? "w-10 h-10 ring-2 ring-indigo-500/20" : "w-8 h-8"}
                `}>
                    {user?.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        getInitials()
                    )}
                </div>

                {mode === 'expanded' && (
                    <>
                        <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-1">
                                <p className="text-sm font-bold text-slate-200 truncate leading-tight">
                                    {displayName}
                                </p>
                                <ShieldCheck size={12} className="text-indigo-400 shrink-0" />
                            </div>
                            <p className="text-[10px] text-slate-500 truncate font-medium">
                                {user?.email}
                            </p>
                        </div>
                        <div className="text-slate-500 group-hover:text-slate-300">
                            {isMenuOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </div>
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className={`
                    absolute bottom-full mb-2 left-0 w-full min-w-[200px]
                    bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-[100]
                    animate-in fade-in slide-in-from-bottom-2 duration-200
                    ${mode === 'compact' ? "right-0 left-auto translate-y-full top-full mb-0 mt-2" : ""}
                `}>
                    <div className="px-3 py-2 border-b border-slate-800 mb-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conta Premium</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Sparkles size={14} className="text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-300">Sincronização Ativa</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            navigate('/settings');
                            setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full p-2.5 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <Settings size={18} />
                        Minha Conta
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-2.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                        <LogOut size={18} />
                        Sair
                    </button>
                </div>
            )}
        </div>
    );
};
