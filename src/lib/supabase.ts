// =============================================
// Cliente Supabase — Kitcho Menu
// =============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use a getter to lazy-initialize the client
let _supabase: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        throw new Error('Supabase URL and ANON KEY must be set in environment variables');
      }
      _supabase = createClient(url, key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
      });
    }
    return Reflect.get(_supabase, prop);
  },
});

// Tipos de la DB
export interface DbRestaurant {
  id: string;
  owner_id: string;
  name: string | null;
  slug: string;
  logo_url: string | null;
  trial_starts_at: string;
  trial_ends_at: string;
  plan: 'trial' | 'free' | 'pro';
  created_at: string;
  updated_at: string;
}

export interface DbMenu {
  id: string;
  restaurant_id: string;
  data: unknown;
  updated_at: string;
}
