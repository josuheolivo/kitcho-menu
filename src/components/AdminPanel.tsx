'use client';

import { useState } from 'react';
import {
  MenuData,
  MenuCollection,
  MenuCategory,
  MenuItem,
  EMPTY_TRANSLATABLE,
  generateId,
  ALLERGENS,
  ensureMenuStructure,
} from '@/lib/types';
import { CheckIcon, MenuIcon, SettingsIcon, SparkIcon } from '@/components/Icons';
import MenuImportModal from '@/components/MenuImportModal';

interface AdminPanelProps {
  menu: MenuData;
  restaurantLogoUrl?: string | null;
  onSave: (menu: MenuData, logoUrl?: string | null) => void;
  saving: boolean;
  saved: boolean;
  saveError?: string | null;
}

type Language = 'es' | 'en' | 'ko' | 'fr' | 'it' | 'pt';

const languages: { code: Language; label: string; name: string }[] = [
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ko', label: 'KO', name: '한국어' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'it', label: 'IT', name: 'Italiano' },
  { code: 'pt', label: 'PT', name: 'Português' },
];

const PRESET_COLORS = [
  { name: 'Naranja Kitcho', hex: '#ea580c' },
  { name: 'Azul Ejecutivo', hex: '#0284c7' },
  { name: 'Verde Esmeralda', hex: '#059669' },
  { name: 'Vino Elegante', hex: '#9f1239' },
  { name: 'Negro Carbón', hex: '#18181b' },
  { name: 'Dorado Cálido', hex: '#d97706' },
];

export default function AdminPanel({
  menu,
  restaurantLogoUrl,
  onSave,
  saving,
  saved,
  saveError,
}: AdminPanelProps) {
  const [currentMenu, setCurrentMenu] = useState<MenuData>(() => ensureMenuStructure(menu));
  const [logoUrl, setLogoUrl] = useState<string | null>(restaurantLogoUrl || null);
  const [activeLang, setActiveLang] = useState<Language>('es');
  const [activeTab, setActiveTab] = useState<'menu' | 'settings'>('menu');
  const [activeMenuId, setActiveMenuId] = useState<string>(
    () => currentMenu.menus?.[0]?.id || 'default-menu'
  );
  const [adminDarkMode, setAdminDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kitcho_admin_dark') === 'true';
    }
    return false;
  });
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Sync menu state when initial prop changes safely
  const [prevMenu, setPrevMenu] = useState(menu);
  if (menu && JSON.stringify(menu.menus) !== JSON.stringify(prevMenu?.menus)) {
    setPrevMenu(menu);
    const normalized = ensureMenuStructure(menu);
    setCurrentMenu(normalized);
    if (normalized.menus && normalized.menus.length > 0) {
      const firstId = normalized.menus[0].id;
      setActiveMenuId((prevId) => {
        const exists = normalized.menus?.some((m) => m.id === prevId);
        return exists ? prevId : firstId;
      });
    }
  }

  const toggleAdminDarkMode = () => {
    setAdminDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('kitcho_admin_dark', String(next));
      return next;
    });
  };

  const menusList = currentMenu.menus || [];
  const activeCollectionIndex = Math.max(
    0,
    menusList.findIndex((m) => m.id === activeMenuId)
  );
  const currentCollection = menusList[activeCollectionIndex] || menusList[0];

  // ─── Handlers de Cartas (MenuCollections) ───────────────────────────
  const addMenuCollection = () => {
    const defaultName = prompt('Nombre de la nueva carta (ej. Carta de Bebidas, Menú del Día):', 'Carta de Bebidas');
    if (!defaultName) return;

    const newCollection: MenuCollection = {
      id: generateId(),
      name: { ...EMPTY_TRANSLATABLE, [activeLang]: defaultName },
      available: true,
      categories: [],
    };

    setCurrentMenu((prev) => ({
      ...prev,
      menus: [...(prev.menus || []), newCollection],
    }));

    setActiveMenuId(newCollection.id);
  };

  const updateCollectionName = (collectionId: string, value: string) => {
    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === collectionId
          ? { ...m, name: { ...m.name, [activeLang]: value } }
          : m
      ),
    }));
  };

  const toggleCollectionAvailable = (collectionId: string) => {
    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === collectionId ? { ...m, available: m.available === false } : m
      ),
    }));
  };

  const toggleCollectionHasFixedPrice = (collectionId: string) => {
    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === collectionId ? { ...m, hasFixedPrice: m.hasFixedPrice !== true } : m
      ),
    }));
  };

  const updateCollectionFixedPrice = (collectionId: string, value: string) => {
    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === collectionId ? { ...m, fixedPrice: value } : m
      ),
    }));
  };

  const removeCollection = (collectionId: string) => {
    if (menusList.length <= 1) {
      alert('Debes mantener al menos una carta o menú activo.');
      return;
    }
    if (!confirm('¿Seguro que deseas eliminar esta carta completa?')) return;

    setCurrentMenu((prev) => {
      const filtered = (prev.menus || []).filter((m) => m.id !== collectionId);
      return { ...prev, menus: filtered };
    });

    const remaining = menusList.filter((m) => m.id !== collectionId);
    if (remaining.length > 0) {
      setActiveMenuId(remaining[0].id);
    }
  };

  // ─── Handlers de Categorías ─────────────────────────────────────────
  const addCategory = () => {
    if (!currentCollection) return;
    const category: MenuCategory = {
      id: generateId(),
      name: { ...EMPTY_TRANSLATABLE, [activeLang]: 'Nueva categoría' },
      available: true,
      items: [],
    };

    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === currentCollection.id
          ? { ...m, categories: [...m.categories, category] }
          : m
      ),
    }));
  };

  const updateCategoryName = (categoryId: string, value: string) => {
    if (!currentCollection) return;
    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === currentCollection.id
          ? {
              ...m,
              categories: m.categories.map((cat) =>
                cat.id === categoryId
                  ? { ...cat, name: { ...cat.name, [activeLang]: value } }
                  : cat
              ),
            }
          : m
      ),
    }));
  };

  const toggleCategoryAvailable = (categoryId: string) => {
    if (!currentCollection) return;
    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === currentCollection.id
          ? {
              ...m,
              categories: m.categories.map((cat) =>
                cat.id === categoryId ? { ...cat, available: cat.available === false } : cat
              ),
            }
          : m
      ),
    }));
  };

  const removeCategory = (id: string) => {
    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === activeMenuId
          ? { ...m, categories: m.categories.filter((cat) => cat.id !== id) }
          : m
      ),
    }));
  };

  const handleImportCollections = (importedCollections: MenuCollection[]) => {
    if (!importedCollections.length) return;
    const firstImportedId = importedCollections[0]?.id;

    setCurrentMenu((prev) => {
      const existing = prev.menus || [];
      let updatedMenus: MenuCollection[];
      if (existing.length === 1 && (existing[0].categories || []).length === 0) {
        updatedMenus = importedCollections;
      } else {
        updatedMenus = [...existing, ...importedCollections];
      }
      const updated = { ...prev, menus: updatedMenus };
      // Auto-save to Supabase DB so it persists permanently
      setTimeout(() => onSave(updated), 50);
      return updated;
    });

    if (firstImportedId) {
      setActiveMenuId(firstImportedId);
    }
  };

  // ─── Handlers de Platos / Items ─────────────────────────────────────
  const addItem = (categoryId: string) => {
    if (!currentCollection) return;
    const item: MenuItem = {
      id: generateId(),
      price: '0.00',
      name: { ...EMPTY_TRANSLATABLE, [activeLang]: 'Nuevo plato' },
      description: { ...EMPTY_TRANSLATABLE },
      allergens: [],
      available: true,
    };

    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === currentCollection.id
          ? {
              ...m,
              categories: m.categories.map((cat) =>
                cat.id === categoryId ? { ...cat, items: [...cat.items, item] } : cat
              ),
            }
          : m
      ),
    }));
  };

  const updateItem = (
    categoryId: string,
    itemId: string,
    field: 'name' | 'price' | 'description',
    value: string
  ) => {
    if (!currentCollection) return;
    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === currentCollection.id
          ? {
              ...m,
              categories: m.categories.map((cat) =>
                cat.id === categoryId
                  ? {
                      ...cat,
                      items: cat.items.map((item) =>
                        item.id === itemId
                          ? field === 'price'
                            ? { ...item, price: value }
                            : { ...item, [field]: { ...item[field], [activeLang]: value } }
                          : item
                      ),
                    }
                  : cat
              ),
            }
          : m
      ),
    }));
  };

  const toggleItemAvailable = (categoryId: string, itemId: string) => {
    if (!currentCollection) return;
    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === currentCollection.id
          ? {
              ...m,
              categories: m.categories.map((cat) =>
                cat.id === categoryId
                  ? {
                      ...cat,
                      items: cat.items.map((item) =>
                        item.id === itemId
                          ? { ...item, available: item.available === false }
                          : item
                      ),
                    }
                  : cat
              ),
            }
          : m
      ),
    }));
  };

  const updateItemAllergens = (categoryId: string, itemId: string, allergens: string[]) => {
    if (!currentCollection) return;
    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === currentCollection.id
          ? {
              ...m,
              categories: m.categories.map((cat) =>
                cat.id === categoryId
                  ? {
                      ...cat,
                      items: cat.items.map((item) =>
                        item.id === itemId ? { ...item, allergens } : item
                      ),
                    }
                  : cat
              ),
            }
          : m
      ),
    }));
  };

  const removeItem = (categoryId: string, itemId: string) => {
    if (!currentCollection) return;
    setCurrentMenu((prev) => ({
      ...prev,
      menus: (prev.menus || []).map((m) =>
        m.id === currentCollection.id
          ? {
              ...m,
              categories: m.categories.map((cat) =>
                cat.id === categoryId
                  ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
                  : cat
              ),
            }
          : m
      ),
    }));
  };

  // ─── Handlers de Ajustes Generales ──────────────────────────────────
  const updateRestaurantName = (restaurantName: string) =>
    setCurrentMenu((prev) => ({ ...prev, restaurantName }));

  const updateTagline = (value: string) =>
    setCurrentMenu((prev) => ({
      ...prev,
      tagline: { ...prev.tagline, [activeLang]: value },
    }));

  const toggleShowName = () =>
    setCurrentMenu((prev) => ({ ...prev, showName: prev.showName === false ? true : false }));

  const toggleShowLogo = () =>
    setCurrentMenu((prev) => ({ ...prev, showLogo: prev.showLogo === false ? true : false }));

  const updatePrimaryColor = (color: string) =>
    setCurrentMenu((prev) => ({ ...prev, primaryColor: color }));

  const updateThemeMode = (mode: 'light' | 'dark') =>
    setCurrentMenu((prev) => ({ ...prev, themeMode: mode }));

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('La imagen del logo no debe superar los 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => onSave({ ...currentMenu, version: Date.now() }, logoUrl);

  // ─── Auto-traducción en Lote ────────────────────────────────────────
  const handleAutoTranslate = async () => {
    setTranslating(true);
    setTranslationError(null);
    try {
      const textsToTranslateSet = new Set<string>();

      if (currentMenu.tagline.es) {
        if (languages.some((l) => l.code !== 'es' && !currentMenu.tagline[l.code])) {
          textsToTranslateSet.add(currentMenu.tagline.es);
        }
      }

      (currentMenu.menus || []).forEach((m) => {
        if (m.name.es && languages.some((l) => l.code !== 'es' && !m.name[l.code])) {
          textsToTranslateSet.add(m.name.es);
        }

        m.categories.forEach((cat) => {
          if (cat.name.es && languages.some((l) => l.code !== 'es' && !cat.name[l.code])) {
            textsToTranslateSet.add(cat.name.es);
          }

          cat.items.forEach((item) => {
            if (item.name.es && languages.some((l) => l.code !== 'es' && !item.name[l.code])) {
              textsToTranslateSet.add(item.name.es);
            }
            if (item.description.es && languages.some((l) => l.code !== 'es' && !item.description[l.code])) {
              textsToTranslateSet.add(item.description.es);
            }
          });
        });
      });

      const textsToTranslate = Array.from(textsToTranslateSet);
      if (textsToTranslate.length === 0) {
        alert('No hay campos vacíos en otros idiomas para traducir desde el español.');
        setTranslating(false);
        return;
      }

      const targetCodes = languages.map((l) => l.code).filter((c) => c !== 'es');
      const { translateMenuBatch } = await import('@/lib/actions');
      const translationsMap = await translateMenuBatch(textsToTranslate, targetCodes);

      setCurrentMenu((prev) => {
        const updatedMenu = { ...prev };

        // Tagline
        const taglineEs = updatedMenu.tagline.es;
        if (taglineEs && translationsMap[taglineEs]) {
          languages.forEach((lang) => {
            if (lang.code !== 'es' && !updatedMenu.tagline[lang.code]) {
              updatedMenu.tagline[lang.code] = translationsMap[taglineEs][lang.code] || '';
            }
          });
        }

        // Cartas & Categorías & Items
        updatedMenu.menus = (updatedMenu.menus || []).map((m) => {
          const mNameEs = m.name.es;
          const updatedMName = { ...m.name };
          if (mNameEs && translationsMap[mNameEs]) {
            languages.forEach((lang) => {
              if (lang.code !== 'es' && !updatedMName[lang.code]) {
                updatedMName[lang.code] = translationsMap[mNameEs][lang.code] || '';
              }
            });
          }

          const updatedCategories = m.categories.map((cat) => {
            const catNameEs = cat.name.es;
            const updatedCatName = { ...cat.name };
            if (catNameEs && translationsMap[catNameEs]) {
              languages.forEach((lang) => {
                if (lang.code !== 'es' && !updatedCatName[lang.code]) {
                  updatedCatName[lang.code] = translationsMap[catNameEs][lang.code] || '';
                }
              });
            }

            const updatedItems = cat.items.map((item) => {
              const itemNameEs = item.name.es;
              const updatedItemName = { ...item.name };
              if (itemNameEs && translationsMap[itemNameEs]) {
                languages.forEach((lang) => {
                  if (lang.code !== 'es' && !updatedItemName[lang.code]) {
                    updatedItemName[lang.code] = translationsMap[itemNameEs][lang.code] || '';
                  }
                });
              }

              const itemDescEs = item.description.es;
              const updatedItemDesc = { ...item.description };
              if (itemDescEs && translationsMap[itemDescEs]) {
                languages.forEach((lang) => {
                  if (lang.code !== 'es' && !updatedItemDesc[lang.code]) {
                    updatedItemDesc[lang.code] = translationsMap[itemDescEs][lang.code] || '';
                  }
                });
              }

              return { ...item, name: updatedItemName, description: updatedItemDesc };
            });

            return { ...cat, name: updatedCatName, items: updatedItems };
          });

          return { ...m, name: updatedMName, categories: updatedCategories };
        });

        return updatedMenu;
      });
    } catch (err) {
      console.error(err);
      setTranslationError(err instanceof Error ? err.message : 'Error al realizar la traducción.');
    } finally {
      setTranslating(false);
    }
  };

  const currentLangLabel = languages.find((lang) => lang.code === activeLang)?.name || 'Español';

  return (
    <section className={`space-y-6 transition-colors ${adminDarkMode ? 'dark bg-slate-900 text-slate-100 p-4 sm:p-6 rounded-2xl' : ''}`}>
      {/* Mensajes de error */}
      {(saveError || translationError) && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-800 p-4 text-sm font-medium text-red-700 dark:text-red-300 space-y-1 animate-fade-in">
          {saveError && <p>❌ Error al guardar el menú: {saveError}</p>}
          {translationError && <p>⚠️ Error de traducción automática: {translationError}</p>}
        </div>
      )}

      {/* Header bar con tabs, idioma, modo oscuro del panel y botón de guardar */}
      <div className={`card p-3 sm:p-4 ${adminDarkMode ? '!bg-slate-800 !border-slate-700' : ''}`}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full gap-1 rounded-xl bg-[#f7f7f4] dark:bg-slate-900 p-1 xl:w-auto" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'menu'}
              onClick={() => setActiveTab('menu')}
              className={`tab-button flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors xl:flex-none ${
                activeTab === 'menu'
                  ? 'bg-white dark:bg-slate-800 text-[var(--kitcho-charcoal)] dark:text-white shadow-sm'
                  : 'text-[var(--text-secondary)] dark:text-slate-400 hover:text-[var(--kitcho-charcoal)] dark:hover:text-white'
              }`}
            >
              <MenuIcon className="h-4 w-4" />Menús y Cartas
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              className={`tab-button flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors xl:flex-none ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-slate-800 text-[var(--kitcho-charcoal)] dark:text-white shadow-sm'
                  : 'text-[var(--text-secondary)] dark:text-slate-400 hover:text-[var(--kitcho-charcoal)] dark:hover:text-white'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />Ajustes
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Idioma selector */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {languages.map((language) => (
                <button
                  type="button"
                  key={language.code}
                  onClick={() => setActiveLang(language.code)}
                  aria-pressed={activeLang === language.code}
                  className={`language-button min-h-10 rounded-lg px-3 text-xs font-bold transition-colors ${
                    activeLang === language.code
                      ? 'bg-[var(--kitcho-charcoal)] dark:bg-orange-600 text-white'
                      : 'text-[var(--text-secondary)] dark:text-slate-400 hover:bg-[#f7f7f4] dark:hover:bg-slate-700'
                  }`}
                >
                  {language.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Modo oscuro del panel */}
              <button
                type="button"
                onClick={toggleAdminDarkMode}
                className="icon-button !h-10 !w-10 dark:!bg-slate-700 dark:!border-slate-600 dark:!text-yellow-400"
                title={adminDarkMode ? 'Modo claro del panel' : 'Modo oscuro del panel'}
              >
                {adminDarkMode ? '☀️' : '🌙'}
              </button>

              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={translating}
                className="btn btn-outline whitespace-nowrap dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-200"
              >
                {translating ? 'Traduciendo…' : '✨ Traducir vacíos'}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary whitespace-nowrap"
                style={{ backgroundColor: currentMenu.primaryColor || '#ea580c', borderColor: currentMenu.primaryColor || '#ea580c' }}
              >
                {saving ? 'Guardando…' : saved ? <><CheckIcon />Guardado</> : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'settings' ? (
        <section role="tabpanel" className={`card max-w-2xl p-5 sm:p-7 animate-fade-in ${adminDarkMode ? '!bg-slate-800 !border-slate-700' : ''}`}>
          <p className="eyebrow mb-3">Identidad del menú</p>
          <h2 className="text-2xl font-bold tracking-tight">Los detalles de tu restaurante</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)] dark:text-slate-400">
            Esta información y diseño se aplican directamente a tu carta pública.
          </p>

          <div className="mt-7 space-y-6">
            {/* Nombre del restaurante */}
            <div>
              <label htmlFor="restaurant-name" className="mb-2 block text-sm font-bold">Nombre del restaurante</label>
              <input
                id="restaurant-name"
                type="text"
                value={currentMenu.restaurantName}
                onChange={(event) => updateRestaurantName(event.target.value)}
                className="input dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                placeholder="Ej. La Buena Mesa"
              />
            </div>

            {/* Logo upload */}
            <div>
              <label className="mb-2 block text-sm font-bold">Logo del restaurante</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-[var(--border)] dark:border-slate-700 bg-[#fcfcfa] dark:bg-slate-900/60 p-4">
                {logoUrl ? (
                  <div className="relative group shrink-0">
                    <img src={logoUrl} alt="Logo del restaurante" className="h-20 w-20 rounded-2xl object-cover border border-[var(--border-strong)] shadow-sm bg-white" />
                    <button
                      type="button"
                      onClick={() => setLogoUrl(null)}
                      className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700 transition-colors"
                      title="Eliminar logo"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-[var(--border-strong)] dark:border-slate-700 bg-white dark:bg-slate-800 text-[var(--text-secondary)]">
                    <SparkIcon className="h-8 w-8 text-[var(--kitcho-gray-dark)]" />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="btn btn-outline btn-sm cursor-pointer inline-flex items-center gap-2 dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-200">
                    <span>{logoUrl ? 'Cambiar imagen' : 'Subir imagen de logo'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <p className="text-xs leading-5 text-[var(--text-secondary)] dark:text-slate-400">
                    Soporta PNG, JPG, WebP o SVG (Máx. 3MB). Aparece libremente centrado en la cabecera.
                  </p>
                </div>
              </div>
            </div>

            {/* Opciones de Visibilidad */}
            <div className="rounded-xl border border-[var(--border)] dark:border-slate-700 bg-[#fcfcfa] dark:bg-slate-900/60 p-4 space-y-4">
              <p className="text-sm font-bold text-[var(--kitcho-charcoal)] dark:text-white">Visibilidad en la cabecera</p>

              <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] dark:border-slate-700 pb-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--kitcho-charcoal)] dark:text-white">Mostrar nombre del restaurante</p>
                  <p className="text-xs text-[var(--text-secondary)] dark:text-slate-400">Muestra el texto del nombre en la cabecera</p>
                </div>
                <button
                  type="button"
                  onClick={toggleShowName}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    currentMenu.showName !== false ? 'bg-[var(--kitcho-orange)]' : 'bg-gray-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={currentMenu.showName !== false}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${currentMenu.showName !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <div>
                  <p className="text-sm font-semibold text-[var(--kitcho-charcoal)] dark:text-white">Mostrar logo del restaurante</p>
                  <p className="text-xs text-[var(--text-secondary)] dark:text-slate-400">Muestra el logotipo en la cabecera</p>
                </div>
                <button
                  type="button"
                  onClick={toggleShowLogo}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    currentMenu.showLogo !== false ? 'bg-[var(--kitcho-orange)]' : 'bg-gray-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={currentMenu.showLogo !== false}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${currentMenu.showLogo !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Selector de Color de Marca */}
            <div className="rounded-xl border border-[var(--border)] dark:border-slate-700 bg-[#fcfcfa] dark:bg-slate-900/60 p-4 space-y-3">
              <p className="text-sm font-bold text-[var(--kitcho-charcoal)] dark:text-white">Color de marca del menú público</p>
              <p className="text-xs text-[var(--text-secondary)] dark:text-slate-400">Elige tu color corporativo para personalizar botones, insignias y acentos.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    type="button"
                    key={color.hex}
                    onClick={() => updatePrimaryColor(color.hex)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                      (currentMenu.primaryColor || '#ea580c').toLowerCase() === color.hex.toLowerCase()
                        ? 'border-black dark:border-white ring-2 ring-orange-500 scale-105'
                        : 'border-[var(--border)] dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: color.hex, color: '#ffffff' }}
                  >
                    <span>{color.name}</span>
                    {(currentMenu.primaryColor || '#ea580c').toLowerCase() === color.hex.toLowerCase() && <span>✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-400">Personalizado:</span>
                <input
                  type="color"
                  value={currentMenu.primaryColor || '#ea580c'}
                  onChange={(e) => updatePrimaryColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={currentMenu.primaryColor || '#ea580c'}
                  onChange={(e) => updatePrimaryColor(e.target.value)}
                  className="input !min-h-9 !py-1 !px-2 text-xs font-mono w-28 uppercase dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                />
              </div>
            </div>

            {/* Selector de Modo Claro / Oscuro del Menú Público */}
            <div className="rounded-xl border border-[var(--border)] dark:border-slate-700 bg-[#fcfcfa] dark:bg-slate-900/60 p-4 space-y-3">
              <p className="text-sm font-bold text-[var(--kitcho-charcoal)] dark:text-white">Estilo del Menú Público</p>
              <p className="text-xs text-[var(--text-secondary)] dark:text-slate-400">Elige si tus clientes verán el menú en fondo claro u oscuro elegante.</p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => updateThemeMode('light')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
                    currentMenu.themeMode !== 'dark'
                      ? 'border-[var(--kitcho-orange)] bg-white dark:bg-slate-800 text-[var(--kitcho-charcoal)] dark:text-white ring-2 ring-orange-500/20 font-bold'
                      : 'border-[var(--border)] dark:border-slate-700 text-[var(--text-secondary)] dark:text-slate-400'
                  }`}
                >
                  <span className="text-2xl mb-1">☀️</span>
                  <span className="text-sm">Modo Claro</span>
                  <span className="text-[10px] text-[var(--text-secondary)] dark:text-slate-400 mt-1">Fondo marfil refinado</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateThemeMode('dark')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
                    currentMenu.themeMode === 'dark'
                      ? 'border-[var(--kitcho-orange)] bg-slate-900 text-white ring-2 ring-orange-500/20 font-bold'
                      : 'border-[var(--border)] dark:border-slate-700 text-[var(--text-secondary)] dark:text-slate-400'
                  }`}
                >
                  <span className="text-2xl mb-1">🌙</span>
                  <span className="text-sm">Modo Oscuro</span>
                  <span className="text-[10px] text-slate-400 mt-1">Fondo carbón elegante</span>
                </button>
              </div>
            </div>

            {/* Eslogan */}
            <div>
              <label htmlFor="restaurant-tagline" className="mb-2 block text-sm font-bold">
                Eslogan en {currentLangLabel}
              </label>
              <input
                id="restaurant-tagline"
                type="text"
                value={currentMenu.tagline[activeLang] || ''}
                onChange={(event) => updateTagline(event.target.value)}
                className="input dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                placeholder="Ej. Cocina de mercado, sin prisa"
              />
              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)] dark:text-slate-400">Usa el selector de idioma de arriba para añadir la versión de cada idioma.</p>
            </div>
          </div>
        </section>
      ) : (
        <section role="tabpanel" className="space-y-6 animate-fade-in">
          {/* Barra superior de Cartas/Menús (Multi-Menu Selector) */}
          <div className="card p-4 space-y-3 dark:!bg-slate-800 dark:!border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] dark:border-slate-700 pb-3">
              <div>
                <p className="eyebrow mb-1">Cartas del restaurante</p>
                <h3 className="text-lg font-bold text-[var(--kitcho-charcoal)] dark:text-white">
                  Organiza tus propuestas (Comida, Bebidas, Menú del Día...)
                </h3>
              </div>
              <button
                type="button"
                onClick={addMenuCollection}
                className="btn btn-primary btn-sm whitespace-nowrap"
                style={{ backgroundColor: currentMenu.primaryColor || '#ea580c', borderColor: currentMenu.primaryColor || '#ea580c' }}
              >
                + Crear nueva carta
              </button>
            </div>

            {/* Listado de Cartas activas con Switch encender/apagar por carta */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {menusList.map((col) => {
                const isActive = col.id === activeMenuId;
                const isAvailable = col.available !== false;

                return (
                  <div
                    key={col.id}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? 'border-[var(--kitcho-orange)] bg-white dark:bg-slate-900 text-[var(--kitcho-charcoal)] dark:text-white shadow-sm ring-2 ring-orange-500/20'
                        : 'border-[var(--border)] dark:border-slate-700 bg-[#f7f7f4] dark:bg-slate-800/80 text-[var(--text-secondary)] dark:text-slate-400'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(col.id)}
                      className="text-left font-bold"
                    >
                      {col.name[activeLang] || col.name.es || 'Carta sin nombre'}
                    </button>

                    {/* Switch Encender/Apagar Carta completa */}
                    <button
                      type="button"
                      onClick={() => toggleCollectionAvailable(col.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        isAvailable ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'
                      }`}
                      title={isAvailable ? 'Carta encendida / activa' : 'Carta apagada / inactiva'}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${isAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>

                    {menusList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCollection(col.id)}
                        className="text-red-500 hover:text-red-700 ml-1"
                        title="Eliminar esta carta"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editor de Categorías y Platos de la Carta Seleccionada */}
          {currentCollection && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 border-b border-[var(--border)] dark:border-slate-700 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <input
                      type="text"
                      value={currentCollection.name[activeLang] || ''}
                      onChange={(e) => updateCollectionName(currentCollection.id, e.target.value)}
                      className="input !min-h-9 !py-1 text-lg font-bold w-64 dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                      placeholder="Nombre de la carta"
                    />
                    <span className={`badge ${currentCollection.available !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
                      {currentCollection.available !== false ? 'Carta Activa' : 'Carta Apagada'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] dark:text-slate-400">
                    Añade y organiza las categorías de esta carta ({currentLangLabel}).
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(true)}
                    className="btn btn-primary w-full sm:w-auto font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white border-none shadow-sm"
                  >
                    ✨ Importar carta (PDF / Foto)
                  </button>
                  <button type="button" onClick={addCategory} className="btn btn-outline w-full sm:w-auto dark:!bg-slate-800 dark:!border-slate-700 dark:!text-white">
                    + Añadir categoría
                  </button>
                </div>
              </div>

              {/* Opción de Precio Fijo Global del Menú Completo (ej. Menú del Día / Degustación) */}
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--kitcho-charcoal)] dark:text-white">
                      🏷️ Precio Fijo Global del Menú Completo
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCollectionHasFixedPrice(currentCollection.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        currentCollection.hasFixedPrice ? 'bg-amber-600' : 'bg-gray-300 dark:bg-slate-700'
                      }`}
                      role="switch"
                      aria-checked={currentCollection.hasFixedPrice}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${currentCollection.hasFixedPrice ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] dark:text-slate-400">
                    Ideal para Menús del Día o Menús Degustación. Al activarlo, no se requerirá un precio por plato individual.
                  </p>
                </div>

                {currentCollection.hasFixedPrice && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-300">Precio menú completo (€):</span>
                    <input
                      type="text"
                      value={currentCollection.fixedPrice || ''}
                      onChange={(e) => updateCollectionFixedPrice(currentCollection.id, e.target.value)}
                      className="input !min-h-9 !py-1 text-center text-sm font-bold w-28 dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                      placeholder="14,50"
                    />
                  </div>
                )}
              </div>

              {currentCollection.categories.length === 0 ? (
                <EmptyMenu onCreate={addCategory} />
              ) : (
                <div className="space-y-5">
                  {currentCollection.categories.map((category, index) => (
                    <CategoryEditor
                      key={category.id}
                      category={category}
                      index={index}
                      activeLang={activeLang}
                      adminDarkMode={adminDarkMode}
                      onUpdateName={updateCategoryName}
                      onToggleAvailable={toggleCategoryAvailable}
                      onRemove={removeCategory}
                      onAddItem={addItem}
                      onUpdateItem={updateItem}
                      onToggleItemAvailable={toggleItemAvailable}
                      onUpdateAllergens={updateItemAllergens}
                      onRemoveItem={removeItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <MenuImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCollections}
      />
    </section>
  );
}

function EmptyMenu({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="card border-dashed px-6 py-14 text-center dark:!bg-slate-800 dark:!border-slate-700">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff0e8] text-lg font-bold text-[var(--kitcho-orange)]">01</span>
      <h3 className="mt-5 text-xl font-bold dark:text-white">Tu carta empieza aquí</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)] dark:text-slate-400">Crea la primera categoría para empezar a organizar tu propuesta.</p>
      <button type="button" onClick={onCreate} className="btn btn-primary mt-6">Crear primera categoría</button>
    </div>
  );
}

interface CategoryEditorProps {
  category: MenuCategory;
  index: number;
  activeLang: Language;
  adminDarkMode?: boolean;
  onUpdateName: (id: string, value: string) => void;
  onToggleAvailable: (id: string) => void;
  onRemove: (id: string) => void;
  onAddItem: (id: string) => void;
  onUpdateItem: (categoryId: string, itemId: string, field: 'name' | 'price' | 'description', value: string) => void;
  onToggleItemAvailable: (categoryId: string, itemId: string) => void;
  onUpdateAllergens: (categoryId: string, itemId: string, allergens: string[]) => void;
  onRemoveItem: (categoryId: string, itemId: string) => void;
}

function CategoryEditor({
  category,
  index,
  activeLang,
  adminDarkMode,
  onUpdateName,
  onToggleAvailable,
  onRemove,
  onAddItem,
  onUpdateItem,
  onToggleItemAvailable,
  onUpdateAllergens,
  onRemoveItem,
}: CategoryEditorProps) {
  const isAvailable = category.available !== false;

  return (
    <article className={`card overflow-hidden ${adminDarkMode ? '!bg-slate-800 !border-slate-700' : ''} ${!isAvailable ? 'opacity-70' : ''}`}>
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5">
        <span className="text-xs font-bold text-[var(--kitcho-gray-dark)]">{String(index + 1).padStart(2, '0')}</span>
        
        <div className="min-w-0 flex-1">
          <input
            id={`category-${category.id}`}
            type="text"
            value={category.name[activeLang] || ''}
            onChange={(event) => onUpdateName(category.id, event.target.value)}
            className="w-full border-0 bg-transparent p-0 text-lg font-bold outline-none placeholder:text-[var(--kitcho-gray-dark)] focus:ring-0 dark:text-white"
            placeholder="Nombre de la categoría"
          />
        </div>

        {/* Switch Disponibilidad de Categoría */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-400">
            {isAvailable ? 'Categoría activa' : 'Categoría apagada'}
          </span>
          <button
            type="button"
            onClick={() => onToggleAvailable(category.id)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isAvailable ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'
            }`}
            role="switch"
            aria-checked={isAvailable}
            title={isAvailable ? 'Desactivar esta categoría' : 'Activar esta categoría'}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${isAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemove(category.id)}
          className="icon-button !h-10 !w-10 text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:!bg-slate-700 dark:!border-slate-600"
          aria-label={`Eliminar categoría ${category.name[activeLang] || index + 1}`}
        >
          <TrashIcon />
        </button>
      </div>

      <div className="space-y-3 bg-[#fcfcfa] dark:bg-slate-900/50 p-4 sm:p-5">
        {category.items.map((item) => (
          <ItemEditor
            key={item.id}
            item={item}
            categoryId={category.id}
            activeLang={activeLang}
            onUpdate={onUpdateItem}
            onToggleAvailable={onToggleItemAvailable}
            onUpdateAllergens={onUpdateAllergens}
            onRemove={onRemoveItem}
          />
        ))}
        <button
          type="button"
          onClick={() => onAddItem(category.id)}
          className="flex min-h-12 w-full items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-bold text-[var(--text-secondary)] dark:text-slate-300 transition-colors hover:border-[var(--kitcho-orange)] hover:text-[var(--kitcho-orange-dark)]"
        >
          + Añadir plato
        </button>
      </div>
    </article>
  );
}

interface ItemEditorProps {
  item: MenuItem;
  categoryId: string;
  activeLang: Language;
  onUpdate: (categoryId: string, itemId: string, field: 'name' | 'price' | 'description', value: string) => void;
  onToggleAvailable: (categoryId: string, itemId: string) => void;
  onUpdateAllergens: (categoryId: string, itemId: string, allergens: string[]) => void;
  onRemove: (categoryId: string, itemId: string) => void;
}

function ItemEditor({
  item,
  categoryId,
  activeLang,
  onUpdate,
  onToggleAvailable,
  onUpdateAllergens,
  onRemove,
}: ItemEditorProps) {
  const isAvailable = item.available !== false;

  return (
    <div className={`rounded-xl border border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4 ${!isAvailable ? 'opacity-70 bg-amber-50/30 dark:bg-amber-950/20' : ''}`}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_7rem_2.75rem]">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <input
              id={`item-name-${item.id}`}
              type="text"
              value={item.name[activeLang] || ''}
              onChange={(event) => onUpdate(categoryId, item.id, 'name', event.target.value)}
              className="input !min-h-10 !py-2 text-sm font-bold dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
              placeholder="Nombre del plato"
            />
            {!isAvailable && (
              <span className="shrink-0 rounded-md bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                AGOTADO
              </span>
            )}
          </div>
          <input
            id={`item-description-${item.id}`}
            type="text"
            value={item.description[activeLang] || ''}
            onChange={(event) => onUpdate(categoryId, item.id, 'description', event.target.value)}
            className="input !min-h-10 !py-2 text-sm dark:!bg-slate-900 dark:!border-slate-700 dark:!text-slate-300"
            placeholder="Descripción opcional"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)] dark:text-slate-400" htmlFor={`item-price-${item.id}`}>
            Precio (€)
          </label>
          <input
            id={`item-price-${item.id}`}
            inputMode="decimal"
            type="text"
            value={item.price}
            onChange={(event) => onUpdate(categoryId, item.id, 'price', event.target.value)}
            className="input !min-h-10 !py-2 text-center text-sm font-bold dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
            placeholder="0,00"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => onRemove(categoryId, item.id)}
            className="icon-button !h-10 !w-10 text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:!bg-slate-700 dark:!border-slate-600"
            aria-label={`Eliminar ${item.name[activeLang] || 'plato'}`}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Fila de controles: Disponibilidad (Agotado) y Alérgenos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--border)] dark:border-slate-700 pt-3">
        {/* Switch Disponibilidad por Cocina */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-400">
            {isAvailable ? '🟢 Disponible' : '🔴 Agotado / No disponible'}
          </span>
          <button
            type="button"
            onClick={() => onToggleAvailable(categoryId, item.id)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isAvailable ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            role="switch"
            aria-checked={isAvailable}
            title={isAvailable ? 'Marcar plato como agotado' : 'Marcar plato como disponible'}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${isAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Alérgenos */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] dark:text-slate-400 block">Alérgenos:</span>
          <div className="flex flex-wrap gap-1">
            {ALLERGENS.map((allergen) => {
              const isSelected = item.allergens?.includes(allergen.id);
              return (
                <button
                  type="button"
                  key={allergen.id}
                  onClick={() => {
                    const currentAllergens = item.allergens || [];
                    const newAllergens = isSelected
                      ? currentAllergens.filter((id) => id !== allergen.id)
                      : [...currentAllergens, allergen.id];
                    onUpdateAllergens(categoryId, item.id, newAllergens);
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg border px-1.5 py-0.5 text-[10px] font-semibold transition-all ${
                    isSelected
                      ? 'border-[var(--kitcho-orange)] bg-[#fff0e8] dark:bg-orange-950/60 text-[var(--kitcho-orange-dark)] dark:text-orange-300'
                      : 'border-[var(--border)] dark:border-slate-700 bg-white dark:bg-slate-900 text-[var(--text-secondary)] dark:text-slate-400'
                  }`}
                  title={allergen.name}
                >
                  <span>{allergen.icon}</span>
                  <span>{allergen.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M10 11v6m4-6v6M9 7l.7-2h4.6l.7 2m-9 0 .8 12h10.2l.8-12" />
    </svg>
  );
}
