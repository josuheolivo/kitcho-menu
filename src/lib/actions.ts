// =============================================
// Server Actions — Kitcho Menu
// =============================================

'use server';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EMPTY_MENU } from '@/lib/types';
import { calculateTrialEnd } from '@/lib/trial';

// Lazy initialization to avoid build-time errors
let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase URL and SERVICE ROLE KEY must be set');
    }
    supabaseAdminInstance = createClient(url, key);
  }
  return supabaseAdminInstance;
}

export async function createRestaurant(ownerId: string) {
  const trialEnd = calculateTrialEnd();
  const supabaseAdmin = getSupabaseAdmin();

  // Create restaurant
  const { data: restaurant, error: restaurantError } = await supabaseAdmin
    .from('restaurants')
    .insert({
      owner_id: ownerId,
      trial_ends_at: trialEnd.toISOString(),
      plan: 'trial',
    })
    .select()
    .single();

  if (restaurantError) {
    throw new Error(restaurantError.message);
  }

  // Create empty menu for restaurant
  const { error: menuError } = await supabaseAdmin
    .from('menus')
    .insert({
      restaurant_id: restaurant.id,
      data: EMPTY_MENU,
    });

  if (menuError) {
    throw new Error(menuError.message);
  }

  return restaurant;
}

export async function saveMenu(restaurantId: string, menuData: unknown) {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { error } = await supabaseAdmin
    .from('menus')
    .update({ data: menuData, updated_at: new Date().toISOString() })
    .eq('restaurant_id', restaurantId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function updateRestaurant(restaurantId: string, data: { name?: string; logo_url?: string }) {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { error } = await supabaseAdmin
    .from('restaurants')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', restaurantId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
