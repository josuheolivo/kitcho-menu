'use client';

import { useEffect, useState } from 'react';
import { MenuData, Translatable, ALLERGENS, ensureMenuStructure, MenuItem } from '@/lib/types';
import BrandMark from '@/components/BrandMark';
import { GlobeIcon, SparkIcon } from '@/components/Icons';

interface MenuPublicProps {
  menu: MenuData;
  restaurantName: string;
  logoUrl?: string | null;
  expired: boolean;
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

export default function MenuPublic({ menu: rawMenu, restaurantName, logoUrl, expired }: MenuPublicProps) {
  const menu = ensureMenuStructure(rawMenu);
  const [lang, setLang] = useState<Language>('es');
  const [isDark, setIsDark] = useState<boolean>(menu.themeMode === 'dark');
  const [bcvRate, setBcvRate] = useState<number | null>(menu.customBcvRate || null);
  const [currencyMode, setCurrencyMode] = useState<'both' | 'usd' | 'ves'>('both');

  const enableMultilingual = menu.enableMultilingual !== false;
  const isVenezuela = menu.countryCode === 'VE' || menu.showBcvRate === true;
  const currencySymbol = menu.currencyCode === 'USD' ? '$' : menu.currencyCode === 'VES' ? 'Bs.' : '€';

  // Obtener tasa oficial BCV si está activado
  useEffect(() => {
    if (isVenezuela && !menu.customBcvRate) {
      fetch('/api/bcv')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.rateVes && !isNaN(data.rateVes)) {
            setBcvRate(data.rateVes);
          }
        })
        .catch((err) => console.warn('No se pudo cargar la tasa BCV:', err));
    }
  }, [isVenezuela, menu.customBcvRate]);

  // Multi-menu active collections
  const activeMenus = (menu.menus || []).filter((m) => m.available !== false);
  const [selectedMenuId, setSelectedMenuId] = useState<string>(
    () => activeMenus[0]?.id || 'default-menu'
  );

  // Floating modal state for viewing a specific category or fixed menu collection
  const [activeModal, setActiveModal] = useState<{
    type: 'collection' | 'category';
    title: Translatable;
    fixedPrice?: string;
    hasFixedPrice?: boolean;
    categories: {
      id: string;
      name: Translatable;
      items: MenuItem[];
    }[];
  } | null>(null);

  useEffect(() => {
    if (!enableMultilingual) return;
    const browserLang = navigator.language.split('-')[0] as Language;
    if (languages.some((l) => l.code === browserLang)) {
      const timeoutId = window.setTimeout(() => setLang(browserLang), 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [enableMultilingual]);

  const t = (text: Translatable | string | undefined) =>
    !text ? '' : typeof text === 'string' ? text : text[lang] || text.es || text.en || '';

  // Get active menu collection
  const currentCollection =
    activeMenus.find((m) => m.id === selectedMenuId) || activeMenus[0];

  // Get visible categories for current active collection
  const visibleCategories = (currentCollection?.categories || [])
    .filter((cat) => cat.available !== false)
    .map((cat) => ({
      ...cat,
      visibleItems: cat.items.filter((item) => t(item.name)),
    }))
    .filter((cat) => cat.visibleItems.length > 0);

  const menuTitle = menu.restaurantName || restaurantName;
  const showLogo = menu.showLogo !== false;
  const showName = menu.showName !== false;
  const primaryColor = menu.primaryColor || '#ea580c';

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f7f7f4] text-[var(--kitcho-charcoal)]'
      }`}
      style={{ '--kitcho-orange': primaryColor } as React.CSSProperties}
    >
      {/* Header Banner */}
      <header
        className={`relative overflow-hidden px-5 pb-16 pt-12 text-white sm:px-8 sm:pb-20 sm:pt-16 ${
          isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-[var(--kitcho-charcoal)]'
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage: `radial-gradient(circle at 88% 15%, ${primaryColor}80, transparent 35%), radial-gradient(circle at 10% 90%, rgba(250,204,21,.15), transparent 25%)`,
          }}
        />

        <div className="relative mx-auto max-w-3xl text-center animate-fade-in">
          {showLogo && (
            logoUrl ? (
              <img
                src={logoUrl}
                alt={menuTitle}
                className="mx-auto max-h-24 sm:max-h-28 w-auto object-contain drop-shadow-md"
              />
            ) : (
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-[#facc15]">
                <SparkIcon className="h-6 w-6" />
              </span>
            )
          )}

          {showName && (
            <h1 className={`display text-4xl text-white sm:text-6xl ${showLogo ? 'mt-5' : ''}`}>
              {menuTitle}
            </h1>
          )}

          {t(menu.tagline) && (
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              {t(menu.tagline)}
            </p>
          )}
        </div>

        <svg
          className={`absolute bottom-0 left-0 h-8 w-full ${isDark ? 'text-slate-950' : 'text-[#f7f7f4]'}`}
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 56V27c200-16 320-16 480 0s320 16 480 0 320-16 480 0v29H0Z" fill="currentColor" />
        </svg>
      </header>

      {/* Navigation Bar (Idiomas + Dark Mode Switch + Collection Selector) */}
      <nav
        className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-950/95 text-slate-200'
            : 'border-[var(--border)] bg-[#f7f7f4]/95 text-[var(--kitcho-charcoal)]'
        }`}
      >
        <div className="container flex min-h-14 flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0">
          <div className="flex items-center justify-between gap-3">
            {enableMultilingual && (
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.1em] text-[var(--text-secondary)]">
                <GlobeIcon className="h-4 w-4" />
                Idioma
              </span>
            )}

            {/* Selector de preferencia de moneda en Venezuela */}
            {isVenezuela && (
              <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/80 rounded-lg p-1 text-[11px] font-bold border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrencyMode('both')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    currencyMode === 'both'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
                  }`}
                >
                  $ / Bs
                </button>
                <button
                  type="button"
                  onClick={() => setCurrencyMode('usd')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    currencyMode === 'usd'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
                  }`}
                >
                  Solo $
                </button>
                <button
                  type="button"
                  onClick={() => setCurrencyMode('ves')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    currencyMode === 'ves'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
                  }`}
                >
                  Solo Bs
                </button>
              </div>
            )}

            {/* Dark mode switch */}
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className={`rounded-full p-2 text-xs font-bold transition-colors ${
                isDark ? 'bg-slate-800 text-yellow-300' : 'bg-white text-slate-700 shadow-sm'
              }`}
              title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {isDark ? '☀️ Claro' : '🌙 Oscuro'}
            </button>
          </div>

          {/* Language selector (solo si enableMultilingual === true) */}
          {enableMultilingual && (
            <div className="flex flex-1 justify-center gap-1 overflow-x-auto py-1 sm:flex-none sm:justify-start">
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => setLang(language.code)}
                  aria-label={`Ver menú en ${language.name}`}
                  aria-pressed={lang === language.code}
                  className={`language-button min-h-9 rounded-lg px-2.5 text-xs font-bold transition-colors ${
                    lang === language.code
                      ? 'text-white'
                      : isDark
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      : 'text-[var(--text-secondary)] hover:bg-white hover:text-[var(--kitcho-charcoal)]'
                  }`}
                  style={
                    lang === language.code
                      ? { backgroundColor: primaryColor }
                      : undefined
                  }
                >
                  {language.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Multi-menu Collection Tabs (if > 1 active collection) */}
        {activeMenus.length > 1 && (
          <div className="border-t border-[var(--border)] dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-2">
            <div className="container flex justify-center gap-2 overflow-x-auto">
              {activeMenus.map((col) => {
                const isSelected = col.id === selectedMenuId;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedMenuId(col.id)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'text-white shadow-sm ring-2 ring-orange-500/20'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-[#f1f2ef] text-[var(--text-secondary)] hover:bg-white'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: primaryColor }
                        : undefined
                    }
                  >
                    {t(col.name) || 'Carta'}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {expired && (
        <div className="border-b border-amber-200 bg-[#fff8db] px-4 py-2.5 text-center text-sm font-medium text-[#795500]">
          Este menú está gestionado con Kitcho Menu.
        </div>
      )}

      {/* Main Content Hub */}
      <main className="container py-8 sm:py-12">
        {visibleCategories.length === 0 ? (
          <EmptyState primaryColor={primaryColor} isDark={isDark} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-10">
            {/* Banner de Precio Fijo Global si aplica */}
            {currentCollection?.hasFixedPrice && currentCollection.fixedPrice && (
              <div
                onClick={() =>
                  setActiveModal({
                    type: 'collection',
                    title: currentCollection.name,
                    hasFixedPrice: true,
                    fixedPrice: currentCollection.fixedPrice,
                    categories: visibleCategories.map((c) => ({
                      id: c.id,
                      name: c.name,
                      items: c.visibleItems,
                    })),
                  })
                }
                className="cursor-pointer rounded-2xl border border-amber-300 dark:border-amber-800 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-6 text-center shadow-md hover:scale-[1.01] transition-transform animate-fade-in"
              >
                <span className="inline-block rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white mb-2">
                  Menú Completo Destacado
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--kitcho-charcoal)] dark:text-white">
                  {t(currentCollection.name)}
                </h2>
                <p className="mt-2 text-2xl font-bold" style={{ color: primaryColor }}>
                  {Number(currentCollection.fixedPrice.replace(',', '.')).toLocaleString('es-ES', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  € <span className="text-xs font-semibold text-gray-500">/ persona</span>
                </p>
                <button
                  type="button"
                  className="mt-4 btn btn-primary btn-sm px-6 font-bold text-white shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  Ver Menú Completo →
                </button>
              </div>
            )}

            {/* Grid de Secciones y Cartas Individuales (Recuadros) */}
            <div>
              <p className="eyebrow mb-4">Selecciona una sección para ver sus platos</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {visibleCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setActiveModal({
                        type: 'category',
                        title: category.name,
                        categories: [
                          {
                            id: category.id,
                            name: category.name,
                            items: category.visibleItems,
                          },
                        ],
                      })
                    }
                    className={`card group relative flex flex-col justify-between p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      isDark
                        ? '!bg-slate-900 !border-slate-800 hover:!border-slate-700'
                        : 'bg-white hover:border-orange-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <span
                          className="badge text-white font-bold text-xs"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {category.visibleItems.length} platos
                        </span>
                      </div>
                      <h3 className="text-xl font-bold tracking-tight group-hover:text-[var(--kitcho-orange)]">
                        {t(category.name)}
                      </h3>
                      <p className={`mt-2 text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {category.visibleItems.map((i) => t(i.name)).join(' · ')}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-xs font-bold" style={{ color: primaryColor }}>
                      <span>Ver sección</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Leyenda Informativa de Alérgenos (Reglamento UE 1169/2011) */}
            <div className="pt-8 border-t border-[var(--border)] dark:border-slate-800">
              <details className={`group rounded-2xl border p-4 transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <summary className="flex cursor-pointer items-center justify-between font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] dark:text-slate-400 select-none">
                  <span className="flex items-center gap-2">
                    <span>ℹ️</span> Información sobre los 14 Alérgenos (Reglamento UE 1169/2011)
                  </span>
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[var(--border)] dark:border-slate-800">
                  {ALLERGENS.map((allergen) => (
                    <div key={allergen.id} className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-[#f8f8f5] border-slate-200 text-slate-700'}`}>
                      <span className="text-base">{allergen.icon}</span>
                      <span>{allergen.name}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-5 text-[var(--text-secondary)] dark:text-slate-500">
                  Información referente al Real Decreto 126/2015 y Reglamento (UE) nº 1169/2011. Si padece alguna alergia o intolerancia alimentaria, informe a nuestro personal.
                </p>
              </details>
            </div>
          </div>
        )}
      </main>

      {/* VENTANA FLOTANTE MODAL (Floating Window Dialog for Selected Category / Menu) */}
      {activeModal && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl flex flex-col animate-scale-in ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-[var(--kitcho-charcoal)]'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between border-b p-5 ${
                isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-slate-50/80'
              }`}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--kitcho-orange)]">
                  {activeModal.type === 'collection' ? 'Menú Completo' : 'Sección de la Carta'}
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight mt-0.5">
                  {t(activeModal.title)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 dark:bg-slate-800 text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-8 flex-1">
              {/* Banner de Precio Fijo si es un menú completo */}
              {activeModal.hasFixedPrice && activeModal.fixedPrice && (
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-4 text-center">
                  <p className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400">
                    Precio Menú Completo
                  </p>
                  <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">
                    {Number(activeModal.fixedPrice.replace(',', '.')).toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    € <span className="text-xs font-normal text-amber-700 dark:text-amber-400">/ persona</span>
                  </p>
                </div>
              )}

              {activeModal.categories.map((cat) => (
                <div key={cat.id} className="space-y-4">
                  {activeModal.type === 'collection' && (
                    <div className="flex items-center gap-3 border-b pb-2 dark:border-slate-800">
                      <h3 className="text-lg font-bold" style={{ color: primaryColor }}>
                        {t(cat.name)}
                      </h3>
                      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    </div>
                  )}

                  <div className="grid gap-3">
                    {cat.items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        name={t(item.name)}
                        description={t(item.description)}
                        price={item.price}
                        allergens={item.allergens}
                        available={item.available !== false}
                        primaryColor={primaryColor}
                        isDark={isDark}
                        isVenezuela={isVenezuela}
                        bcvRate={bcvRate}
                        currencyMode={currencyMode}
                        currencySymbol={currencySymbol}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div
              className={`border-t p-4 text-center ${
                isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-slate-50/80'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn btn-outline btn-sm w-full sm:w-auto font-bold dark:!bg-slate-800 dark:!border-slate-700 dark:!text-white"
              >
                Cerrar y ver otras secciones
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Footer */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-30 border-t px-4 py-2.5 backdrop-blur-xl transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-950/95 text-slate-300'
            : 'border-[var(--border)] bg-white/95 text-[var(--text-secondary)]'
        }`}
      >
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-1 text-xs">
          <div className="flex items-center">
            <BrandMark compact />
            <span className="ml-2 text-xs font-medium">Tu carta digital</span>
          </div>

          {isVenezuela && bcvRate && (
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              Tasa oficial BCV: <span className="font-bold">{bcvRate.toFixed(2)} Bs/USD</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

function MenuItemCard({
  name,
  description,
  price,
  allergens,
  available,
  primaryColor,
  isDark,
  isVenezuela,
  bcvRate,
  currencyMode,
  currencySymbol,
}: {
  name: string;
  description: string;
  price: string;
  allergens?: string[];
  available: boolean;
  primaryColor: string;
  isDark: boolean;
  isVenezuela?: boolean;
  bcvRate?: number | null;
  currencyMode?: 'both' | 'usd' | 'ves';
  currencySymbol?: string;
}) {
  const parsedPrice = Number(price.replace(',', '.'));
  const hasPrice = price.trim() !== '' && Number.isFinite(parsedPrice) && parsedPrice > 0;

  const formattedUsd = hasPrice
    ? parsedPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';

  const vesAmount = hasPrice && bcvRate ? parsedPrice * bcvRate : null;
  const formattedVes = vesAmount
    ? vesAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';

  return (
    <article
      className={`card group p-4 transition-all duration-200 hover:shadow-md sm:p-5 ${
        isDark ? '!bg-slate-900 !border-slate-800' : ''
      } ${!available ? 'opacity-60 grayscale-[40%]' : ''}`}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`text-base font-bold sm:text-lg ${
                isDark ? 'text-slate-100' : 'text-[var(--kitcho-charcoal)]'
              }`}
            >
              {name}
            </h4>

            {!available && (
              <span className="rounded-md bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                AGOTADO
              </span>
            )}
          </div>

          {description && (
            <p
              className={`mt-1.5 max-w-xl text-sm leading-6 ${
                isDark ? 'text-slate-400' : 'text-[var(--text-secondary)]'
              }`}
            >
              {description}
            </p>
          )}

          {allergens && allergens.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Alérgenos">
              {allergens.map((allergenId) => {
                const allergen = ALLERGENS.find((a) => a.id === allergenId);
                if (!allergen) return null;
                return (
                  <span
                    key={allergenId}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                      isDark
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-[#f1f2ef] text-[var(--text-secondary)] border-[var(--border)]'
                    }`}
                    title={allergen.name}
                  >
                    <span>{allergen.icon}</span>
                    <span>{allergen.name}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {hasPrice && (
          <div
            className="shrink-0 text-right rounded-xl px-3 py-1.5 shadow-sm"
            style={{
              backgroundColor: `${primaryColor}18`,
              color: primaryColor,
            }}
          >
            {isVenezuela ? (
              <div className="flex flex-col items-end">
                {(currencyMode === 'both' || currencyMode === 'usd') && (
                  <span className="text-sm font-extrabold tracking-tight">
                    $ {formattedUsd}
                  </span>
                )}
                {(currencyMode === 'both' || currencyMode === 'ves') && formattedVes && (
                  <span className="text-[11px] font-bold opacity-85">
                    {formattedVes} Bs.
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm font-bold">
                {formattedUsd} {currencySymbol || '€'}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function EmptyState({ primaryColor, isDark }: { primaryColor: string; isDark: boolean }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center animate-fade-in">
      <span
        className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <SparkIcon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-2xl font-bold tracking-tight">Menú en preparación</h2>
      <p className={`mt-2 leading-7 ${isDark ? 'text-slate-400' : 'text-[var(--text-secondary)]'}`}>
        Este restaurante está terminando de preparar su carta. Vuelve pronto.
      </p>
    </div>
  );
}
