import { db } from '../../../services/db';
import { SyncJob } from '../../types';

export const SyncQueue = {
    async enqueue(job: Omit<SyncJob, 'id' | 'status' | 'retry_count' | 'created_at'>) {
        // Find existing pending or retry jobs for the same entity
        const existingJobs = await db.sync_queue
            .where('entity_id')
            .equals(job.entity_id)
            .toArray();

        const pendingJob = existingJobs.find(j => j.status === 'pending' || j.status === 'retry');

        if (pendingJob) {
            if (job.type === 'delete') {
                // If we are deleting, remove all other pending jobs for this entity
                await db.sync_queue.where('entity_id').equals(job.entity_id).delete();
                // If it was already created in Supabase (not a pending 'create'), we still need the delete job
                if (pendingJob.type !== 'create') {
                    await db.sync_queue.add({
                        ...job,
                        status: 'pending',
                        retry_count: 0,
                        created_at: Date.now()
                    });
                }
                return;
            }

            if (job.type === 'update') {
                if (pendingJob.type === 'create' || pendingJob.type === 'update') {
                    // Merge update into existing pending job
                    await db.sync_queue.update(pendingJob.id, {
                        payload: { ...pendingJob.payload, ...job.payload },
                        status: 'pending', // Reset to pending if it was in retry
                        retry_count: 0
                    });
                    return;
                }
            }
        }

        // Otherwise just add it
        await db.sync_queue.add({
            ...job,
            status: 'pending',
            retry_count: 0,
            created_at: Date.now()
        });
    },

    async getPending(): Promise<SyncJob[]> {
        return await db.sync_queue
            .where('status')
            .anyOf(['pending', 'retry'])
            .sortBy('created_at');
    }
};
