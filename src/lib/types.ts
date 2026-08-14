// =============================================
// Tipos TypeScript — Kitcho Menu V2.0
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
  categories?: MenuCategory[];  // Legacy support
  menus?: MenuCollection[];     // V2.0 Multi-menu support
  showName?: boolean;
  showLogo?: boolean;
  primaryColor?: string;        // HEX e.g. '#ea580c'
  themeMode?: 'light' | 'dark'; // 'light' | 'dark'
}

export interface MenuCollection {
  id: string;
  name: Translatable;           // e.g. "Carta Principal", "Carta de Bebidas", "Menú del Día"
  available?: boolean;          // Encendido / Apagado
  hasFixedPrice?: boolean;      // Si tiene un precio fijo global (ej. Menú del Día / Degustación)
  fixedPrice?: string;          // Valor del precio fijo global (ej. "14.50")
  categories: MenuCategory[];
}

export interface MenuCategory {
  id: string;
  name: Translatable;
  available?: boolean;          // Encendido / Apagado
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  price: string;
  name: Translatable;
  description: Translatable;
  allergens?: string[];
  available?: boolean;          // Encendido / Apagado (Agotado)
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
  showName: true,
  showLogo: true,
  primaryColor: '#ea580c',
  themeMode: 'light',
  menus: [
    {
      id: 'default-menu',
      name: { ...EMPTY_TRANSLATABLE, es: 'Carta Principal', en: 'Main Menu' },
      available: true,
      categories: [],
    },
  ],
};

export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Garantiza la retrocompatibilidad y la estructura completa V2.0 de MenuData
 */
export function ensureMenuStructure(menu: Partial<MenuData> | null | undefined): MenuData {
  const version = menu?.version || Date.now();
  const restaurantName = menu?.restaurantName || '';
  const tagline = menu?.tagline || { ...EMPTY_TRANSLATABLE };
  const showName = menu?.showName !== false;
  const showLogo = menu?.showLogo !== false;
  const primaryColor = menu?.primaryColor || '#ea580c';
  const themeMode = menu?.themeMode === 'dark' ? 'dark' : 'light';

  let menusList: MenuCollection[] = [];

  if (Array.isArray(menu?.menus) && menu.menus.length > 0) {
    menusList = menu.menus.map((m) => ({
      id: m.id || generateId(),
      name: m.name || { ...EMPTY_TRANSLATABLE, es: 'Carta' },
      available: m.available !== false,
      hasFixedPrice: m.hasFixedPrice === true,
      fixedPrice: m.fixedPrice || '',
      categories: (m.categories || []).map((cat) => ({
        id: cat.id || generateId(),
        name: cat.name || { ...EMPTY_TRANSLATABLE },
        available: cat.available !== false,
        items: (cat.items || []).map((item) => ({
          ...item,
          available: item.available !== false,
        })),
      })),
    }));
  } else if (Array.isArray(menu?.categories)) {
    menusList = [
      {
        id: generateId(),
        name: { ...EMPTY_TRANSLATABLE, es: 'Carta Principal', en: 'Main Menu' },
        available: true,
        categories: menu.categories.map((cat) => ({
          id: cat.id || generateId(),
          name: cat.name || { ...EMPTY_TRANSLATABLE },
          available: cat.available !== false,
          items: (cat.items || []).map((item) => ({
            ...item,
            available: item.available !== false,
          })),
        })),
      },
    ];
  } else {
    menusList = [
      {
        id: generateId(),
        name: { ...EMPTY_TRANSLATABLE, es: 'Carta Principal', en: 'Main Menu' },
        available: true,
        categories: [],
      },
    ];
  }

  return {
    restaurantName,
    tagline,
    version,
    showName,
    showLogo,
    primaryColor,
    themeMode,
    menus: menusList,
  };
}

export interface Allergen {
  id: string;
  name: string;
  icon: string;
}

export const ALLERGENS: Allergen[] = [
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'crustaceos', name: 'Crustáceos', icon: '🦀' },
  { id: 'huevos', name: 'Huevos', icon: '🥚' },
  { id: 'pescado', name: 'Pescado', icon: '🐟' },
  { id: 'cacahuetes', name: 'Cacahuetes', icon: '🥜' },
  { id: 'soja', name: 'Soja', icon: '🫘' },
  { id: 'lacteos', name: 'Lácteos', icon: '🥛' },
  { id: 'frutos_cascara', name: 'Frutos de cáscara', icon: '🌰' },
  { id: 'apio', name: 'Apio', icon: '🥬' },
  { id: 'mostaza', name: 'Mostaza', icon: '🍯' },
  { id: 'sesamo', name: 'Sésamo', icon: '🥯' },
  { id: 'sulfitos', name: 'Sulfitos', icon: '🍷' },
  { id: 'altramuces', name: 'Altramuces', icon: '🌱' },
  { id: 'moluscos', name: 'Moluscos', icon: '🦪' },
];
