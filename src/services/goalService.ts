import { db } from './db';
import { Goal } from '../types';

export const goalService = {
    async fetchGoals(): Promise<Goal[]> {
        return await db.goals.toArray();
    },

    async createGoal(goal: Partial<Goal>): Promise<Goal> {
        const newGoal: Goal = {
            id: crypto.randomUUID(),
            name: goal.name || 'Nova Meta',
            targetAmount: goal.targetAmount || 0,
            currentAmount: goal.currentAmount || 0,
            deadline: goal.deadline,
            icon: goal.icon || 'Target',
            color: goal.color || '#6366f1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await db.goals.add(newGoal);
        return newGoal;
    },

    async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
        await db.goals.update(id, {
            ...updates,
            updated_at: new Date().toISOString()
        });
    },

    async deleteGoal(id: string): Promise<void> {
        await db.goals.delete(id);
    },

    async addProgress(id: string, amount: number): Promise<void> {
        const goal = await db.goals.get(id);
        if (!goal) throw new Error('Goal not found');
        
        const newAmount = (goal.currentAmount || 0) + amount;
        await db.goals.update(id, {
            currentAmount: newAmount,
            updated_at: new Date().toISOString()
        });
    }
};
