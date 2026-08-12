'use client';

import { useState } from 'react';
import { MenuData, MenuCategory, MenuItem, EMPTY_TRANSLATABLE, generateId } from '@/lib/types';

interface MenuEditorProps {
  menu: MenuData;
  onSave: (menu: MenuData) => void;
  saving: boolean;
  saved: boolean;
}

export default function MenuEditor({ menu, onSave, saving, saved }: MenuEditorProps) {
  const [currentMenu, setCurrentMenu] = useState<MenuData>(menu);
  const [activeLang, setActiveLang] = useState<'es' | 'en' | 'ko' | 'fr' | 'it' | 'pt'>('es');

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
      {/* Language selector & Save */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400 mr-2">Editando:</span>
          {langs.map(lang => (
            <button
              key={lang.code}
              onClick={() => setActiveLang(lang.code)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeLang === lang.code
                  ? 'bg-[var(--kitcho-accent)] text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-green-400 text-sm animate-fade-in">✓ Guardado</span>
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

      {/* Restaurant info */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Información del restaurante</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-300">Nombre del restaurante</label>
            <input
              type="text"
              value={currentMenu.restaurantName}
              onChange={(e) => updateRestaurantName(e.target.value)}
              className="input"
              placeholder="Ej: La Buena Mesa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-300">Eslogan / Tagline</label>
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

      {/* Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Categorías y platos</h3>
          <button onClick={addCategory} className="btn btn-outline text-sm py-2">
            + Añadir categoría
          </button>
        </div>

        {currentMenu.categories.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-gray-400 mb-4">Tu menú está vacío. ¡Empieza añadiendo una categoría!</p>
            <button onClick={addCategory} className="btn btn-primary">
              Crear primera categoría
            </button>
          </div>
        )}

        {currentMenu.categories.map((category, catIndex) => (
          <div key={category.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={category.name[activeLang]}
                onChange={(e) => updateCategoryName(category.id, e.target.value)}
                className="input flex-1 mr-3 font-bold text-lg"
                placeholder="Nombre de la categoría"
              />
              <button
                onClick={() => removeCategory(category.id)}
                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Eliminar categoría"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <div key={item.id} className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_auto] gap-3">
                    <div>
                      <input
                        type="text"
                        value={item.name[activeLang]}
                        onChange={(e) => updateItem(category.id, item.id, 'name', e.target.value)}
                        className="input mb-2"
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
                        className="input text-center"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 text-center mt-1">Precio (€)</p>
                    </div>
                    <div className="flex items-start">
                      <button
                        onClick={() => removeItem(category.id, item.id)}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Eliminar plato"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addItem(category.id)}
                className="w-full py-3 border-2 border-dashed border-white/10 rounded-lg text-gray-500 hover:border-[var(--kitcho-accent)] hover:text-[var(--kitcho-accent)] transition-colors text-sm"
              >
                + Añadir plato
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
