import { PostgrestError } from '@supabase/supabase-js';

export class ApiError extends Error {
    constructor(public message: string, public code?: string, public details?: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export const handleApiError = (error: PostgrestError) => {
    console.error(`[API Error] ${error.code}: ${error.message}`);
    throw new ApiError(error.message, error.code, error.details);
};
