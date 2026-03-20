import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
    if (supabaseInstance) return supabaseInstance;

    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key || !url.startsWith('http')) {
        if (url && !url.startsWith('http')) {
            console.warn('Supabase URL is invalid. It must start with http:// or https://');
        } else {
            console.warn('Supabase credentials missing. Database features will be disabled until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Secrets.');
        }
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
