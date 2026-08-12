// =============================================
// Tipos TypeScript — Kitcho Menu
// =============================================

export interface Restaurant {
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

export interface MenuData {
  restaurantName: string;
  tagline: Translatable;
  version: number;
  categories: MenuCategory[];
}

export interface MenuCategory {
  id: string;
  name: Translatable;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  price: string;
  name: Translatable;
  description: Translatable;
}

export interface Translatable {
  es: string;
  en: string;
  ko: string;
  fr: string;
  it: string;
  pt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

export const EMPTY_TRANSLATABLE: Translatable = {
  es: '',
  en: '',
  ko: '',
  fr: '',
  it: '',
  pt: '',
};

export const EMPTY_MENU: MenuData = {
  restaurantName: '',
  tagline: { ...EMPTY_TRANSLATABLE },
  version: Date.now(),
  categories: [],
};

export function generateId(): string {
  return crypto.randomUUID();
}
