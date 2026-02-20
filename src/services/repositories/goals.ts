
import { db } from '../db';
import { Goal } from '../../types';
import { ValidationError } from '../errors';
import { handleDBError } from '../repositoryUtils';

export const getGoals = async (): Promise<Goal[]> => {
    try {
        return await db.goals.toArray();
    } catch (e) {
        throw handleDBError(e, 'DB_READ_ERROR');
    }
};

export const postGoal = async (goal: Goal): Promise<void> => {
    try {
        if (goal.targetAmount <= 0) {
            throw new ValidationError('Target must be positive', 'VALIDATION_INVALID_VALUE');
        }
        await db.goals.put(goal);
    } catch (e) {
        throw handleDBError(e, 'DB_WRITE_ERROR');
    }
};

export const removeGoal = async (id: string): Promise<void> => {
    try {
        await db.goals.delete(id);
    } catch (e) {
        throw handleDBError(e, 'DB_DELETE_ERROR');
    }
};

export const updateGoalValue = async (id: string, newValue: number): Promise<void> => {
    try {
        const goal = await db.goals.get(id);
        if (goal) {
            await db.goals.put({ ...goal, currentAmount: newValue });
        }
    } catch (e) {
        throw handleDBError(e, 'DB_WRITE_ERROR');
    }
};
