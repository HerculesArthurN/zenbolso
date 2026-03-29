import { db } from './db';
import { RecurringTransaction } from '../types';
import { transactionService } from './transactionService';

export const recurringService = {
    async getRecurring(): Promise<RecurringTransaction[]> {
        const localRules = await db.recurring_transactions.toArray();
        return localRules.map(r => ({
            ...r,
            type: r.type || 'EXPENSE'
        })) as RecurringTransaction[];
    },

    async addRecurring(rule: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
        const localRule: RecurringTransaction = {
            id: crypto.randomUUID(),
            user_id: rule.user_id || 'local',
            account_id: rule.account_id || '',
            category_id: rule.category_id || null,
            description: rule.description || '',
            amount: rule.amount || 0,
            type: rule.type || 'EXPENSE',
            day_of_month: rule.day_of_month || 1,
            active: rule.active ?? true,
            last_processed_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await db.recurring_transactions.add(localRule);
        return localRule;
    },

    async deleteRecurring(id: string): Promise<void> {
        await db.recurring_transactions.delete(id);
    },

    async toggleActive(id: string, active: boolean): Promise<void> {
        await db.recurring_transactions.update(id, { active });
    },

    async processDueTransactions(): Promise<number> {
        const rules = await this.getRecurring();
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentDay = now.getDate();

        let generatedCount = 0;

        for (const rule of rules) {
            if (!rule.active) continue;

            const lastProcessed = rule.last_processed_date; // YYYY-MM

            // Logic: If today >= day_of_month AND last_processed_month < current_month
            if (currentDay >= rule.day_of_month && (!lastProcessed || lastProcessed < currentMonthStr)) {
                try {
                    // Create the actual transaction
                    await transactionService.createTransaction({
                        account_id: rule.account_id,
                        category_id: rule.category_id,
                        amount: rule.amount,
                        description: rule.description,
                        date: `${currentMonthStr}-${String(rule.day_of_month).padStart(2, '0')}`,
                        type: rule.type,
                        is_paid: true
                    });

                    // Update the rule's last_processed_date
                    await this.updateLastProcessed(rule.id, currentMonthStr);
                    generatedCount++;
                } catch (error) {
                    console.error(`Failed to process recurring rule ${rule.id}:`, error);
                }
            }
        }

        return generatedCount;
    },

    async updateLastProcessed(id: string, monthStr: string): Promise<void> {
        await db.recurring_transactions.update(id, { last_processed_date: monthStr });
    }
};
