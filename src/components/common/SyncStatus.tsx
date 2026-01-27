import React from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export const SyncStatus: React.FC = () => {
    const { status, pendingCount, retry } = useSyncStatus();
    const { t } = useTranslation();

    const config = {
        synced: {
            icon: Cloud,
            color: 'text-emerald-500',
            label: t('sync.synced', 'Tudo sincronizado'),
            animate: false
        },
        syncing: {
            icon: RefreshCw,
            color: 'text-blue-500',
            label: t('sync.syncing', 'Sincronizando...'),
            animate: true
        },
        'offline-pending': {
            icon: CloudOff,
            color: 'text-amber-500',
            label: t('sync.offline', 'Aguardando conexão...'),
            animate: false
        },
        error: {
            icon: AlertCircle,
            color: 'text-rose-500',
            label: t('sync.error', 'Erro na sincronização'),
            animate: false
        }
    };

    const { icon: Icon, color, label, animate } = config[status];

    return (
        <div
            className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all cursor-help select-none",
                status === 'error' && "cursor-pointer hover:border-rose-200 dark:hover:border-rose-900"
            )}
            title={label}
            onClick={status === 'error' ? retry : undefined}
        >
            <Icon
                size={16}
                className={clsx(color, animate && "animate-spin")}
            />
            {pendingCount > 0 && status !== 'synced' && (
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-md min-w-[1.2rem] text-center">
                    {pendingCount}
                </span>
            )}
            <span className="hidden sm:inline text-xs font-medium text-slate-600 dark:text-slate-400">
                {status === 'synced' ? t('sync.ok', 'Nuvem') : label}
            </span>
        </div>
    );
};
