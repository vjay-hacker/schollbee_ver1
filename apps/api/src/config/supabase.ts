import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Public Supabase Client (For Client-side Operations/Auth emulation if needed)
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Admin Supabase Client (Bypasses RLS - FOR BACKEND INTERNAL WORK ONLY)
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
