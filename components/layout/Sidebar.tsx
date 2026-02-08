import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Plus, Target, Settings, RefreshCcw, PieChart, X } from 'lucide-react';
import { ThemeToggle } from '../../src/components/layout/ThemeToggle';
import { useData } from '../../context/DataContext';
import { useSummaryQuery } from '../../hooks/useFinanceData';
import { BrandLogo } from '../../src/components/ui/BrandLogo';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '../../src/hooks/useLocaleFormat';
import { UserWidget } from '../../src/components/layout/UserWidget';
import { safeNumber } from '../../src/utils/numberUtils';

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useLocaleFormat();
  const { openTransactionModal } = useData();
  const { data: summary } = useSummaryQuery();
  const location = useLocation();

  const safeBalance = safeNumber(summary?.netBalance, 0);

  const getLinkClass = (path: string) => {
    const currentPath = location.pathname;
    // Map '/' to '/dashboard' if needed, but here they seem distinct or '/' is dashboard
    const isActive = path === '/' ? currentPath === '/' : currentPath.startsWith(path);

    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
      ? 'bg-primary/10 text-primary font-bold'
      : 'text-text-muted hover:bg-background dark:hover:bg-surface-dark'
      }`;
  };

  const content = (
    <>
      {/* Header / Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-border-color dark:border-border-color-dark">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-10 w-10 p-1" variant="color" />
          <span className="font-extrabold text-xl text-text-main dark:text-text-main-dark tracking-tighter uppercase italic">
            Zen<span className="text-primary">Bolso</span>
          </span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main">
            <X size={24} />
          </button>
        )}
      </div>

      {/* Quick Summary Widget */}
      <div className="px-6 py-6">
        <div className="bg-background dark:bg-surface-dark/50 rounded-xl p-4 border border-border-color dark:border-border-color-dark shadow-sm">
          <p className="text-[10px] text-text-muted uppercase font-bold mb-1 tracking-widest">{t('sidebar.current_balance')}</p>
          <p className={`text-xl font-black ${safeBalance >= 0 ? 'text-emerald-500' : 'text-danger'}`}>
            {summary ? formatCurrency(safeBalance, { notation: 'compact' }) : '...'}
          </p>
        </div>

        <button
          onClick={() => {
            openTransactionModal();
            if (isMobile) onClose?.();
          }}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-primary dark:bg-primary-dark text-primary-fg dark:text-primary-fg-dark py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={18} /> {t('sidebar.new_transaction')}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <Link to="/" className={getLinkClass('/')} onClick={isMobile ? onClose : undefined}>
          <LayoutDashboard size={20} /> {t('sidebar.home')}
        </Link>
        <Link to="/transactions" className={getLinkClass('/transactions')} onClick={isMobile ? onClose : undefined}>
          <List size={20} /> {t('sidebar.extract')}
        </Link>
        <Link to="/planning" className={getLinkClass('/planning')} onClick={isMobile ? onClose : undefined}>
          <Target size={20} /> {t('sidebar.planning')}
        </Link>
        <Link to="/recurring" className={getLinkClass('/recurring')} onClick={isMobile ? onClose : undefined}>
          <RefreshCcw size={20} /> {t('sidebar.recurring')}
        </Link>
        <Link to="/reports" className={getLinkClass('/reports')} onClick={isMobile ? onClose : undefined}>
          <PieChart size={20} /> {t('sidebar.reports')}
        </Link>
        <Link to="/settings" className={getLinkClass('/settings')} onClick={isMobile ? onClose : undefined}>
          <Settings size={20} /> {t('sidebar.settings')}
        </Link>
      </nav>

      <div className="border-t border-border-color dark:border-border-color-dark mt-auto">
        <div className="p-4 flex items-center justify-between">
          <ThemeToggle />
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
            v3.1.2
          </div>
        </div>
        <UserWidget mode="expanded" />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Drawer */}
        <div className="relative flex flex-col w-72 h-full bg-surface dark:bg-surface-dark shadow-2xl animate-in slide-in-from-left duration-300">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-surface dark:bg-surface-dark border-r border-border-color dark:border-border-color-dark z-40">
      {content}
    </div>
  );
};