import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSqlRunner = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<any[] | null>(null);

    const runSql = async (query: string) => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const { data, error: rpcError } = await supabase.rpc('exec_sql', {
                sql_query: query,
            });

            if (rpcError) throw rpcError;

            setResults(Array.isArray(data) ? data : [data]);
        } catch (err: any) {
            console.error('SQL Runner Error:', err);
            setError(err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return { runSql, results, loading, error };
};
