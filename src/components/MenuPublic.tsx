'use client';

import { useState } from 'react';
import { MenuData, Translatable } from '@/lib/types';

interface MenuPublicProps {
  menu: MenuData;
  restaurantName: string;
  expired: boolean;
}

export default function MenuPublic({ menu, restaurantName, expired }: MenuPublicProps) {
  const [lang, setLang] = useState<'es' | 'en' | 'ko' | 'fr' | 'it' | 'pt'>('es');

  // Detect browser language on mount
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs = ['es', 'en', 'ko', 'fr', 'it', 'pt'];
    if (supportedLangs.includes(browserLang) && lang === 'es') {
      setLang(browserLang as typeof lang);
    }
  }

  const t = (text: Translatable | string | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text.es || text.en || '';
  };

  const hasItems = menu.categories.some(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-[var(--kitcho-gray)]">
      {/* Hero Header */}
      <header className="relative bg-[var(--kitcho-charcoal)] overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--kitcho-orange)] via-transparent to-transparent"></div>
        </div>
        
        <div className="relative container py-10 md:py-14 text-center">
          <div className="animate-fade-in">
            {menu.restaurantName ? (
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {menu.restaurantName}
              </h1>
            ) : (
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {restaurantName}
              </h1>
            )}
            {t(menu.tagline) && (
              <p className="text-[var(--kitcho-yellow)] text-lg font-medium">{t(menu.tagline)}</p>
            )}
          </div>
        </div>

        {/* Wave decoration */}
        <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none">
          <path d="M0 50V25C240 0 480 0 720 25C960 50 1200 50 1440 25V50H0Z" fill="var(--kitcho-gray)"/>
        </svg>
      </header>

      {/* Language Selector */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-[var(--border)] shadow-sm">
        <div className="container py-3">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { code: 'es', label: 'ES', flag: '🇪🇸' },
              { code: 'en', label: 'EN', flag: '🇬🇧' },
              { code: 'ko', label: 'KO', flag: '🇰🇷' },
              { code: 'fr', label: 'FR', flag: '🇫🇷' },
              { code: 'it', label: 'IT', flag: '🇮🇹' },
              { code: 'pt', label: 'PT', flag: '🇵🇹' },
            ].map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code as typeof lang)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  lang === l.code
                    ? 'bg-[var(--kitcho-orange)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--kitcho-gray)]'
                }`}
              >
                <span className="mr-1">{l.flag}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Trial expired badge */}
      {expired && (
        <div className="bg-[var(--kitcho-yellow)] text-[var(--kitcho-charcoal)] text-center py-2.5 text-sm font-semibold">
          <span className="mr-1">⚡</span>
          Menú gestionado con Kitcho Menu
        </div>
      )}

      {/* Menu Content */}
      <main className="container py-8 pb-24">
        {!hasItems ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-white border border-[var(--border)] flex items-center justify-center mb-4 shadow-sm">
              <span className="text-4xl">🍽️</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Menú en preparación</h2>
            <p className="text-[var(--text-secondary)]">Este restaurante aún no ha publicado su menú.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-10">
            {menu.categories.map((category, catIdx) => {
              const categoryName = t(category.name);
              const visibleItems = category.items.filter(item => t(item.name));
              if (visibleItems.length === 0) return null;

              return (
                <section key={category.id} className={`animate-slide-up`} style={{ animationDelay: `${catIdx * 0.1}s`, opacity: 0 }}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-xl md:text-2xl font-bold text-[var(--kitcho-charcoal)] tracking-tight">
                      {categoryName}
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                    <span className="badge badge-orange">{visibleItems.length}</span>
                  </div>

                  {/* Items */}
                  <div className="grid gap-3">
                    {visibleItems.map((item, itemIdx) => (
                      <article
                        key={item.id}
                        className="card p-4 hover:shadow-md hover:border-[var(--kitcho-orange)]/30 transition-all group animate-fade-in"
                        style={{ animationDelay: `${(catIdx * 0.1) + (itemIdx * 0.05)}s`, opacity: 0 }}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[var(--kitcho-charcoal)] group-hover:text-[var(--kitcho-orange)] transition-colors">
                              {t(item.name)}
                            </h3>
                            {t(item.description) && (
                              <p className="text-[var(--text-secondary)] text-sm mt-1 line-clamp-2">
                                {t(item.description)}
                              </p>
                            )}
                          </div>
                          {item.price && Number(item.price) > 0 && (
                            <div className="flex-shrink-0 bg-[var(--kitcho-orange)] text-white font-bold text-sm px-3 py-1.5 rounded-lg">
                              {Number(item.price).toFixed(2)}€
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer watermark */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[var(--border)] py-3 px-4">
        <div className="container flex items-center justify-center gap-2">
          <span className="text-xs text-[var(--text-secondary)]">Menú digital con</span>
          <span className="text-xs font-bold text-[var(--kitcho-orange)]">Kitcho Menu</span>
        </div>
      </footer>
    </div>
  );
}
