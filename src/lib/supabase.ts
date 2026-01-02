import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// DEBUG LOGS
console.log('[Supabase Init] URL:', supabaseUrl);
console.log('[Supabase Init] Key:', supabaseAnonKey ? `${supabaseAnonKey.slice(0, 10)}...${supabaseAnonKey.slice(-5)}` : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'CRITICAL ERROR: Supabase environment variables missing. Authentication will fail. Check .env file.'
    );
}

if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    console.warn('⚠️ WARNING: VITE_SUPABASE_URL should start with https://. Check your configuration.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
