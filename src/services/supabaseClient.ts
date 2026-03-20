import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
    if (supabaseInstance) return supabaseInstance;

    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn('Supabase credentials missing. Database features will be disabled until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Secrets.');
        return null;
    }

    try {
        supabaseInstance = createClient(url, key);
        return supabaseInstance;
    } catch (e) {
        console.error('Failed to initialize Supabase:', e);
        return null;
    }
};
