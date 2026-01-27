import { supabase } from '../../lib/supabase';
import { db } from '../../../services/db';
import { SyncQueue } from './SyncQueue';
import { SyncJob } from '../../types';

let isProcessing = false;

export const SyncProcessor = {
    /**
     * Main entry point to process the queue.
     * Can be called after any mutation or periodically.
     */
    async process() {
        if (isProcessing) return;

        // Simple check for online status
        if (!navigator.onLine) {
            console.log('SyncProcessor: Offline, skipping sync.');
            return;
        }

        isProcessing = true;

        try {
            const jobs = await SyncQueue.getPending();
            if (jobs.length === 0) return;

            console.log(`SyncProcessor: Processing ${jobs.length} jobs...`);

            for (const job of jobs) {
                try {
                    await this.executeJob(job);
                    await db.sync_queue.delete(job.id!);
                    console.log(`SyncProcessor: Job ${job.id} (${job.type} ${job.entity}) success.`);
                } catch (error: any) {
                    console.error(`SyncProcessor: Failed to process job ${job.id}:`, error);

                    const retryCount = (job.retry_count || 0) + 1;
                    // Max 5 retries before marking as permanent error
                    const status = retryCount > 5 ? 'error' : 'retry';

                    await db.sync_queue.update(job.id!, {
                        status: status,
                        retry_count: retryCount,
                        error: error.message || 'Unknown error'
                    });

                    // If it's a network error (e.g. status 0 or 5xx), we should probably stop processing the rest
                    if (!navigator.onLine || (error.status && error.status >= 500)) {
                        break;
                    }
                }
            }
        } finally {
            isProcessing = false;
        }
    },

    async executeJob(job: SyncJob) {
        const { type, entity, payload, entity_id } = job;

        // Ensure payload has the correct entity_id and user_id if possible
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const finalPayload = {
            ...payload,
            id: entity_id,
            user_id: user.id
        };

        switch (type) {
            case 'create':
            case 'update':
                // Use upsert with explicit ID matching to prevent duplicates
                const { error } = await supabase
                    .from(entity)
                    .upsert(finalPayload)
                    .select()
                    .single();

                if (error) throw error;
                break;

            case 'delete':
                const { error: delError } = await supabase
                    .from(entity)
                    .delete()
                    .eq('id', entity_id);

                if (delError) throw delError;
                break;
        }
    }
};

// Listen for online status to trigger sync
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        SyncProcessor.process();
    });
    // Trigger initial sync on load
    SyncProcessor.process();
}
