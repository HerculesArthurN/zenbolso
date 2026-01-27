import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { SyncProcessor } from '../services/sync/SyncProcessor';

export type SyncUIStatus = 'synced' | 'syncing' | 'offline-pending' | 'error';

export const useSyncStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Live query the sync queue
    const queueItems = useLiveQuery(() => db.sync_queue.toArray()) || [];

    const pendingCount = queueItems.filter(item => item.status === 'pending' || item.status === 'retry').length;
    const errorCount = queueItems.filter(item => item.status === 'error').length;
    const isSyncing = SyncProcessor.isProcessing();

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    let status: SyncUIStatus = 'synced';

    if (errorCount > 0) {
        status = 'error';
    } else if (!isOnline && pendingCount > 0) {
        status = 'offline-pending';
    } else if (isSyncing || pendingCount > 0) {
        status = 'syncing';
    }

    return {
        status,
        pendingCount,
        errorCount,
        isOnline,
        retry: () => SyncProcessor.process()
    };
};
