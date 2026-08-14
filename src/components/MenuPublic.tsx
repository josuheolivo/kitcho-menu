'use client';

import { useEffect, useState } from 'react';
import { MenuData, Translatable, ALLERGENS, ensureMenuStructure } from '@/lib/types';
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

  // Multi-menu selector state
  const activeMenus = (menu.menus || []).filter((m) => m.available !== false);
  const [selectedMenuId, setSelectedMenuId] = useState<string>(
    () => activeMenus[0]?.id || 'default-menu'
  );

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as Language;
    if (languages.some((l) => l.code === browserLang)) {
      const timeoutId = window.setTimeout(() => setLang(browserLang), 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, []);

  const t = (text: Translatable | string | undefined) =>
    !text ? '' : typeof text === 'string' ? text : text[lang] || text.es || text.en || '';

  // Get active menu collection
  const currentCollection =
    activeMenus.find((m) => m.id === selectedMenuId) || activeMenus[0];

  // Filter visible categories for the selected menu collection
  const visibleCategories = (currentCollection?.categories || [])
    .filter((cat) => cat.available !== false)
    .map((category) => ({
      ...category,
      visibleItems: category.items.filter((item) => t(item.name)),
    }))
    .filter((category) => category.visibleItems.length > 0);

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

      {/* Navigation Bar (Idiomas + Theme Toggle + Multi-Menu Tabs) */}
      <nav
        className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-950/95 text-slate-200'
            : 'border-[var(--border)] bg-[#f7f7f4]/95 text-[var(--kitcho-charcoal)]'
        }`}
      >
        <div className="container flex min-h-14 flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.1em] text-[var(--text-secondary)]">
              <GlobeIcon className="h-4 w-4" />
              Idioma
            </span>

            {/* Dark mode switch for client */}
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

          {/* Language selector */}
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
        </div>

        {/* Multi-menu Collection Selector Tabs (if more than 1 active menu exists) */}
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

      {/* Main Content */}
      <main className="container py-10 sm:py-14">
        {/* Banner de Precio Fijo Global (ej. Menú del Día / Degustación) */}
        {currentCollection?.hasFixedPrice && currentCollection.fixedPrice && (
          <div className="mx-auto max-w-3xl mb-8 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-slate-900 p-5 text-center shadow-sm animate-fade-in">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
              Menú Completo Fijo
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 dark:text-amber-100">
              {Number(currentCollection.fixedPrice.replace(',', '.')).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 ml-1.5 font-sans">/ persona</span>
            </p>
            <p className="text-xs text-amber-800 dark:text-slate-400 mt-1">
              Precio global único para la selección completa de esta carta.
            </p>
          </div>
        )}

        {visibleCategories.length === 0 ? (
          <EmptyState primaryColor={primaryColor} isDark={isDark} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-12 sm:space-y-16">
            {visibleCategories.map((category, categoryIndex) => (
              <section
                key={category.id}
                className="animate-slide-up"
                style={{ animationDelay: `${categoryIndex * 0.07}s` }}
              >
                <div className="mb-5 flex items-center gap-4">
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-[.12em]"
                      style={{ color: primaryColor }}
                    >
                      {String(categoryIndex + 1).padStart(2, '0')}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                      {t(category.name)}
                    </h2>
                  </div>
                  <div
                    className={`mt-6 h-px flex-1 ${
                      isDark ? 'bg-slate-800' : 'bg-[var(--border)]'
                    }`}
                  />
                  <span
                    className="badge mt-6 text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {category.visibleItems.length}
                  </span>
                </div>

                <div className="grid gap-3">
                  {category.visibleItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      name={t(item.name)}
                      description={t(item.description)}
                      price={item.price}
                      allergens={item.allergens}
                      available={item.available !== false}
                      primaryColor={primaryColor}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Leyenda Informativa de Alérgenos (Reglamento UE 1169/2011) */}
        {visibleCategories.length > 0 && (
          <div className="mx-auto max-w-3xl mt-12 pt-8 border-t border-[var(--border)] dark:border-slate-800">
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
        )}
      </main>

      {/* Footer */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-30 border-t px-4 py-3 backdrop-blur-xl transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-950/95 text-slate-300'
            : 'border-[var(--border)] bg-white/95 text-[var(--text-secondary)]'
        }`}
      >
        <div className="container flex items-center justify-center">
          <BrandMark compact />
          <span className="ml-2 text-xs">Tu carta digital</span>
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
}: {
  name: string;
  description: string;
  price: string;
  allergens?: string[];
  available: boolean;
  primaryColor: string;
  isDark: boolean;
}) {
  const parsedPrice = Number(price);
  const hasPrice = price.trim() !== '' && Number.isFinite(parsedPrice) && parsedPrice > 0;

  return (
    <article
      className={`card group p-4 transition-all duration-200 hover:shadow-md sm:p-5 ${
        isDark ? '!bg-slate-900 !border-slate-800' : ''
      } ${!available ? 'opacity-60 grayscale-[40%]' : ''}`}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`text-base font-bold sm:text-lg ${
                isDark ? 'text-slate-100' : 'text-[var(--kitcho-charcoal)]'
              }`}
            >
              {name}
            </h3>

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
          <p
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-bold shadow-sm"
            style={{
              backgroundColor: `${primaryColor}18`,
              color: primaryColor,
            }}
          >
            {parsedPrice.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            €
          </p>
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
