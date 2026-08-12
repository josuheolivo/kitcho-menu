'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MenuData, MenuCategory, MenuItem, EMPTY_TRANSLATABLE, generateId } from '@/lib/types';

interface AdminPanelProps {
  restaurantId: string;
  menu: MenuData;
  onSave: (menu: MenuData) => void;
  saving: boolean;
  saved: boolean;
}

export default function AdminPanel({ restaurantId, menu, onSave, saving, saved }: AdminPanelProps) {
  const [currentMenu, setCurrentMenu] = useState<MenuData>(menu);
  const [activeLang, setActiveLang] = useState<'es' | 'en' | 'ko' | 'fr' | 'it' | 'pt'>('es');
  const [activeTab, setActiveTab] = useState<'menu' | 'settings'>('menu');

  const langs = [
    { code: 'es', label: 'ES' },
    { code: 'en', label: 'EN' },
    { code: 'ko', label: 'KO' },
    { code: 'fr', label: 'FR' },
    { code: 'it', label: 'IT' },
    { code: 'pt', label: 'PT' },
  ] as const;

  const updateRestaurantName = (name: string) => {
    setCurrentMenu(prev => ({ ...prev, restaurantName: name }));
  };

  const updateTagline = (value: string) => {
    setCurrentMenu(prev => ({
      ...prev,
      tagline: { ...prev.tagline, [activeLang]: value },
    }));
  };

  const addCategory = () => {
    const newCategory: MenuCategory = {
      id: generateId(),
      name: { ...EMPTY_TRANSLATABLE, [activeLang]: 'Nueva Categoría' },
      items: [],
    };
    setCurrentMenu(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
  };

  const updateCategoryName = (categoryId: string, value: string) => {
    setCurrentMenu(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, name: { ...cat.name, [activeLang]: value } }
          : cat
      ),
    }));
  };

  const removeCategory = (categoryId: string) => {
    setCurrentMenu(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId),
    }));
  };

  const addItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: generateId(),
      price: '0.00',
      name: { ...EMPTY_TRANSLATABLE, [activeLang]: 'Nuevo Plato' },
      description: { ...EMPTY_TRANSLATABLE },
    };
    setCurrentMenu(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, newItem] }
          : cat
      ),
    }));
  };

  const updateItem = (categoryId: string, itemId: string, field: 'name' | 'price' | 'description', value: string) => {
    setCurrentMenu(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId
                  ? field === 'price'
                    ? { ...item, price: value }
                    : { ...item, [field]: { ...item[field], [activeLang]: value } }
                  : item
              ),
            }
          : cat
      ),
    }));
  };

  const removeItem = (categoryId: string, itemId: string) => {
    setCurrentMenu(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
          : cat
      ),
    }));
  };

  const handleSave = () => {
    onSave({ ...currentMenu, version: Date.now() });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--kitcho-gray)] p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'menu'
              ? 'bg-white text-[var(--kitcho-charcoal)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          📋 Menú
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'settings'
              ? 'bg-white text-[var(--kitcho-charcoal)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          ⚙️ Ajustes
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="card animate-fade-in">
          <h3 className="text-lg font-bold mb-4">Información del restaurante</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                Nombre del restaurante
              </label>
              <input
                type="text"
                value={currentMenu.restaurantName}
                onChange={(e) => updateRestaurantName(e.target.value)}
                className="input"
                placeholder="Ej: La Buena Mesa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                Eslogan / Tagline ({langs.find(l => l.code === activeLang)?.label})
              </label>
              <input
                type="text"
                value={currentMenu.tagline[activeLang]}
                onChange={(e) => updateTagline(e.target.value)}
                className="input"
                placeholder="Ej: Cocina tradicional con amor"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'menu' && (
        <>
          {/* Language selector & Save */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-[var(--text-secondary)] mr-1">Editando:</span>
              {langs.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeLang === lang.code
                      ? 'bg-[var(--kitcho-orange)] text-white'
                      : 'bg-[var(--kitcho-gray)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-green-600 text-sm font-medium animate-fade-in">✓ Guardado</span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Categorías y platos</h3>
              <button onClick={addCategory} className="btn btn-outline btn-sm">
                + Categoría
              </button>
            </div>

            {currentMenu.categories.length === 0 && (
              <div className="card text-center py-12 animate-fade-in">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--kitcho-gray)] flex items-center justify-center mb-4">
                  <span className="text-3xl">🍽️</span>
                </div>
                <p className="text-[var(--text-secondary)] mb-4">Tu menú está vacío</p>
                <button onClick={addCategory} className="btn btn-primary btn-sm">
                  Crear primera categoría
                </button>
              </div>
            )}

            {currentMenu.categories.map((category) => (
              <div key={category.id} className="card animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={category.name[activeLang]}
                    onChange={(e) => updateCategoryName(category.id, e.target.value)}
                    className="input flex-1 font-semibold"
                    placeholder="Nombre de la categoría"
                  />
                  <button
                    onClick={() => removeCategory(category.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar categoría"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div key={item.id} className="bg-[var(--kitcho-gray)] rounded-lg p-3 border border-[var(--border)]">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_auto] gap-3">
                        <div>
                          <input
                            type="text"
                            value={item.name[activeLang]}
                            onChange={(e) => updateItem(category.id, item.id, 'name', e.target.value)}
                            className="input mb-2 text-sm"
                            placeholder="Nombre del plato"
                          />
                          <input
                            type="text"
                            value={item.description[activeLang]}
                            onChange={(e) => updateItem(category.id, item.id, 'description', e.target.value)}
                            className="input text-sm"
                            placeholder="Descripción (opcional)"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.price}
                            onChange={(e) => updateItem(category.id, item.id, 'price', e.target.value)}
                            className="input text-center text-sm"
                            placeholder="0.00"
                          />
                          <p className="text-xs text-[var(--text-secondary)] text-center mt-1">Precio €</p>
                        </div>
                        <div className="flex items-start">
                          <button
                            onClick={() => removeItem(category.id, item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar plato"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => addItem(category.id)}
                    className="w-full py-2.5 border-2 border-dashed border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:border-[var(--kitcho-orange)] hover:text-[var(--kitcho-orange)] transition-colors text-sm font-medium"
                  >
                    + Añadir plato
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
