// =============================================
// Tipos Principales de Kitcho Menu V2.0
// =============================================

export interface Translatable {
  es?: string;
  en?: string;
  ko?: string;
  fr?: string;
  it?: string;
  pt?: string;
  [key: string]: string | undefined;
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
  version: 1,
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

export interface MenuItem {
  id: string;
  price: string;
  name: Translatable;
  description: Translatable;
  available?: boolean;
  allergens?: string[];
}

export interface MenuCategory {
  id: string;
  name: Translatable;
  available?: boolean;
  items: MenuItem[];
}

export interface MenuCollection {
  id: string;
  name: Translatable;
  available?: boolean;
  hasFixedPrice?: boolean;
  fixedPrice?: string;
  categories: MenuCategory[];
}

export interface MenuData {
  restaurantName: string;
  tagline: Translatable;
  version: number;
  showName?: boolean;
  showLogo?: boolean;
  primaryColor?: string;
  themeMode?: 'light' | 'dark';
  menus?: MenuCollection[];
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Garantiza la retrocompatibilidad y la estructura completa V2.0 de MenuData con IDs estables
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
    menusList = menu.menus.map((m, mIdx) => ({
      id: m.id || `menu-${mIdx}`,
      name: m.name || { ...EMPTY_TRANSLATABLE, es: 'Carta' },
      available: m.available !== false,
      hasFixedPrice: m.hasFixedPrice === true,
      fixedPrice: m.fixedPrice || '',
      categories: (m.categories || []).map((cat, cIdx) => ({
        id: cat.id || `cat-${mIdx}-${cIdx}`,
        name: cat.name || { ...EMPTY_TRANSLATABLE },
        available: cat.available !== false,
        items: (cat.items || []).map((item, iIdx) => ({
          ...item,
          id: item.id || `item-${mIdx}-${cIdx}-${iIdx}`,
          available: item.available !== false,
        })),
      })),
    }));
  } else if (Array.isArray((menu as unknown as { categories?: MenuCategory[] })?.categories)) {
    const oldCategories = (menu as unknown as { categories: MenuCategory[] }).categories;
    menusList = [
      {
        id: 'default-menu',
        name: { ...EMPTY_TRANSLATABLE, es: 'Carta Principal', en: 'Main Menu' },
        available: true,
        categories: oldCategories.map((cat, cIdx) => ({
          id: cat.id || `cat-0-${cIdx}`,
          name: cat.name || { ...EMPTY_TRANSLATABLE },
          available: cat.available !== false,
          items: (cat.items || []).map((item, iIdx) => ({
            ...item,
            id: item.id || `item-0-${cIdx}-${iIdx}`,
            available: item.available !== false,
          })),
        })),
      },
    ];
  } else {
    menusList = [
      {
        id: 'default-menu',
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
  { id: 'crustaceos', name: 'Crustáceos', icon: '🦞' },
  { id: 'huevos', name: 'Huevos', icon: '🥚' },
  { id: 'pescado', name: 'Pescado', icon: '🐟' },
  { id: 'cacahuetes', name: 'Cacahuetes', icon: '🥜' },
  { id: 'soja', name: 'Soja', icon: '🫘' },
  { id: 'lacteos', name: 'Lácteos', icon: '🧀' },
  { id: 'frutos_cascara', name: 'Frutos de cáscara', icon: '🌰' },
  { id: 'apio', name: 'Apio', icon: '🥬' },
  { id: 'mostaza', name: 'Mostaza', icon: '🌭' },
  { id: 'sesamo', name: 'Sésamo', icon: '🥯' },
  { id: 'sulfitos', name: 'Sulfitos', icon: '🍷' },
  { id: 'altramuces', name: 'Altramuces', icon: '🌼' },
  { id: 'moluscos', name: 'Moluscos', icon: '🦪' },
];
