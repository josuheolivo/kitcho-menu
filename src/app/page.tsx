'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import {
  ArrowUpRightIcon,
  CheckIcon,
  GlobeIcon,
  MenuIcon,
  PenIcon,
  SparkIcon,
} from '@/components/Icons';

const features = [
  {
    title: 'Múltiples Cartas y Menús',
    description: 'Organiza por separado tu Carta de Comida, Carta de Vinos, Menú del Día o Sugerencias.',
    icon: MenuIcon,
    className: 'md:col-span-2',
    tag: 'Nuevo V2.0',
  },
  {
    title: 'Traducción inmediata en 6 idiomas',
    description: 'Tu carta habla español, inglés, francés, italiano, portugués y coreano con un solo toque.',
    icon: GlobeIcon,
    className: '',
    tag: 'Automático',
  },
  {
    title: '14 Alérgenos de la UE',
    description: 'Cumple el Real Decreto 126/2015 al instante con distintivos claros para cada plato.',
    icon: CheckIcon,
    className: '',
    tag: 'Obligatorio UE',
  },
  {
    title: 'Control de Cocina: Disponible / Agotado',
    description: 'Enciende o apaga platos y categorías en tiempo real según el stock de tu cocina.',
    icon: SparkIcon,
    className: '',
    tag: 'Tiempo Real',
  },
  {
    title: 'Diseño de Marca y Modo Oscuro',
    description: 'Elige tus colores corporativos y ofrece una experiencia visual clara u oscura impecable.',
    icon: PenIcon,
    className: 'md:col-span-2',
    tag: 'Personalizable',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f7f4]">
      {/* Navegación */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[#f7f7f4]/90 backdrop-blur-xl">
        <div className="container flex h-[4.5rem] items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm">Iniciar sesión</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Crear mi menú <ArrowUpRightIcon /></Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative border-b border-[var(--border)] bg-[#f7f7f4] pb-16 pt-14 sm:pb-24 sm:pt-20">
          <div className="pointer-events-none absolute -right-28 top-0 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-amber-100/60 blur-3xl" />

          <div className="container relative grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
            <div className="max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-800 shadow-sm mb-6 animate-pulse-subtle">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-orange-500 text-white text-[10px]">✨</span>
                <span>La plataforma de menús digitales QR #1 en España</span>
              </div>

              <h1 className="display max-w-xl text-[clamp(3.2rem,7.5vw,6rem)] text-[var(--kitcho-charcoal)]">
                Tu carta merece una <em className="text-[var(--kitcho-orange)]">mejor primera impresión.</em>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
                Crea un menú digital profesional con múltiples cartas, traducción automática a 6 idiomas, alérgenos obligatorios y control de disponibilidad en tiempo real.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="btn btn-primary btn-lg group">
                  Empieza gratis 15 días <ArrowUpRightIcon className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link href="#como-funciona" className="btn btn-outline btn-lg">Ver cómo funciona</Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[var(--text-secondary)]">
                {['15 días de prueba gratis', 'Sin tarjeta de crédito', 'Listo en 3 minutos', '14 Alérgenos de la UE'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-[var(--kitcho-orange)]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Preview Mockup */}
            <InteractiveMenuPreview />
          </div>
        </section>

        {/* Métricas Clave */}
        <section className="border-b border-[var(--border)] bg-white py-10">
          <div className="container grid gap-6 text-center sm:grid-cols-4">
            <Metric label="Tiempo de montaje" value="Minutos, no días" highlight="⚡ Ultra rápido" />
            <Metric label="Idiomas incluidos" value="6 lenguas" highlight="🌍 Automático" />
            <Metric label="Alérgenos UE" value="14 Obligatorios" highlight="⚖️ RD 126/2015" />
            <Metric label="Para tus clientes" value="Sin descargas" highlight="📱 Directo al QR" />
          </div>
        </section>

        {/* Características */}
        <section className="bg-white py-20 sm:py-28">
          <div className="container">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">Una herramienta, bien resuelta</p>
              <h2 className="display text-4xl text-[var(--kitcho-charcoal)] sm:text-5xl">
                Menos administración. Más tiempo para el servicio.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">
                Todo lo necesario para cumplir normativas y ofrecer a tus clientes una carta moderna, clara e impecable.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {features.map(({ title, description, icon: Icon, className, tag }) => (
                <article
                  key={title}
                  className={`card group relative min-h-60 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-8 ${className}`}
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0e8] text-[var(--kitcho-orange)] transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                      {tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[var(--kitcho-charcoal)]">{title}</h3>
                  <p className="mt-3 max-w-md leading-7 text-[var(--text-secondary)]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Paso a paso */}
        <section id="como-funciona" className="border-y border-[var(--border)] bg-[#172033] py-20 text-white sm:py-28">
          <div className="container grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="eyebrow mb-4 !text-[#facc15]">De la idea a la mesa</p>
              <h2 className="display text-4xl sm:text-5xl">Una carta lista para servir.</h2>
              <p className="mt-5 max-w-md text-lg leading-8 text-white/65">
                Sin aprender herramientas complejas ni depender de diseñadores externos.
              </p>
            </div>
            <ol className="grid gap-5">
              {[
                ['01', 'Crea tu espacio', 'Regístrate en 30 segundos con el nombre de tu restaurante.'],
                ['02', 'Construye tus cartas', 'Organiza Comidas, Bebidas o Menú del Día con alérgenos y precios.'],
                ['03', 'Comparte tu QR', 'Imprime tu código QR y permite que tus clientes consulten tu carta en su idioma.'],
              ].map(([number, title, description]) => (
                <li key={number} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-white/15 py-5 first:border-t-0 first:pt-0">
                  <span className="font-mono text-sm font-bold text-[#facc15]">{number}</span>
                  <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-1 text-white/60">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-[#f7f7f4] py-20 sm:py-28">
          <div className="container">
            <div className="card card-raised overflow-hidden bg-[var(--kitcho-orange)] px-6 py-12 text-center text-white sm:px-12 sm:py-16 relative">
              <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 90% 10%, #ffffff, transparent 40%)' }} />
              <p className="eyebrow justify-center !text-orange-100 before:!bg-orange-100">Empieza hoy</p>
              <h2 className="display mx-auto mt-4 max-w-2xl text-4xl sm:text-5xl">Que tu menú hable tan bien de ti como tu cocina.</h2>
              <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-orange-50">Diseña tu carta digital hoy. Prueba Kitcho Menu durante 15 días sin compromiso.</p>
              <Link href="/register" className="btn btn-lg mt-8 border-white bg-white text-[var(--kitcho-orange-dark)] hover:bg-orange-50 shadow-lg">
                Crear mi menú gratis <ArrowUpRightIcon />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-white py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-[var(--text-secondary)] sm:flex-row">
          <BrandMark compact />
          <p>Kitcho Menu · Cartas digitales para restaurantes.</p>
          <Link href="/login" className="font-semibold text-[var(--kitcho-charcoal)] hover:text-[var(--kitcho-orange)]">
            Acceder al panel
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--kitcho-gray-dark)]">{label}</p>
      <p className="text-xl font-bold tracking-tight text-[var(--kitcho-charcoal)]">{value}</p>
      <p className="text-xs font-semibold text-[var(--kitcho-orange-dark)]">{highlight}</p>
    </div>
  );
}

/**
 * Interactive Phone Mockup Component for Landing Page
 */
function InteractiveMenuPreview() {
  const [activeTab, setActiveTab] = useState<'comida' | 'bebidas' | 'menu_dia'>('comida');
  const [activeLang, setActiveLang] = useState<'ES' | 'EN' | 'FR'>('ES');
  const [isDarkPreview, setIsDarkPreview] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-md animate-scale-in lg:max-w-lg">
      <div className="absolute -left-5 top-8 z-10 hidden rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-bold text-[var(--text-secondary)] shadow-md sm:block animate-float">
        🌍 6 Idiomas incluidos
      </div>

      <div className="absolute -right-3 bottom-10 z-10 hidden rounded-xl bg-[var(--kitcho-yellow)] px-3.5 py-2 text-xs font-bold text-[var(--kitcho-charcoal)] shadow-md sm:block animate-float" style={{ animationDelay: '2s' }}>
        ⚡ Actualizado al instante
      </div>

      {/* Outer Phone Shell */}
      <div className="rounded-[2.2rem] border-[9px] border-[#172033] bg-[#172033] p-2 shadow-[0_28px_60px_rgba(23,32,51,.28)]">
        <div className={`overflow-hidden rounded-[1.6rem] transition-colors duration-300 ${isDarkPreview ? 'bg-slate-950 text-slate-100' : 'bg-[#f7f7f4] text-slate-900'}`}>
          
          {/* Header */}
          <div className="bg-[#172033] px-5 pb-6 pt-6 text-center text-white relative">
            <button
              type="button"
              onClick={() => setIsDarkPreview(!isDarkPreview)}
              className="absolute top-3 right-3 rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-yellow-300 hover:bg-white/20 transition-colors"
              title="Cambiar tema de previsualización"
            >
              {isDarkPreview ? '☀️ Claro' : '🌙 Oscuro'}
            </button>

            <span className="mx-auto grid h-10 w-10 place-items-center rounded-2xl bg-white/10 shadow-sm">
              <SparkIcon className="h-5 w-5 text-[#facc15]" />
            </span>
            <p className="mt-2 font-bold text-base">La Buena Mesa</p>
            <p className="mt-0.5 text-xs text-white/60">Cocina de mercado & vinos</p>
          </div>

          {/* Interactive Bar */}
          <div className={`-mt-2 rounded-t-[1.4rem] px-4 pb-4 pt-3 transition-colors ${isDarkPreview ? 'bg-slate-950' : 'bg-[#f7f7f4]'}`}>
            
            {/* Language Selector Chips */}
            <div className="mb-3 flex justify-center gap-1.5">
              {(['ES', 'EN', 'FR'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveLang(lang)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                    activeLang === lang
                      ? 'bg-[var(--kitcho-orange)] text-white shadow-xs'
                      : isDarkPreview
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-white text-[var(--text-secondary)] border border-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Menu Collection Tabs */}
            <div className="mb-4 flex justify-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('comida')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  activeTab === 'comida'
                    ? 'bg-orange-600 text-white'
                    : isDarkPreview
                    ? 'text-slate-400'
                    : 'text-slate-600'
                }`}
              >
                Comida
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bebidas')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  activeTab === 'bebidas'
                    ? 'bg-orange-600 text-white'
                    : isDarkPreview
                    ? 'text-slate-400'
                    : 'text-slate-600'
                }`}
              >
                Vinos & Bebidas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('menu_dia')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  activeTab === 'menu_dia'
                    ? 'bg-orange-600 text-white'
                    : isDarkPreview
                    ? 'text-slate-400'
                    : 'text-slate-600'
                }`}
              >
                Menú del Día
              </button>
            </div>

            {/* Dishes Content */}
            {activeTab === 'comida' && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-[10px] font-bold uppercase tracking-[.11em] text-[var(--kitcho-orange)]">
                  {activeLang === 'ES' ? 'Para compartir' : activeLang === 'EN' ? 'To Share' : 'À partager'}
                </p>
                <PreviewDish
                  isDark={isDarkPreview}
                  title={activeLang === 'ES' ? 'Croquetas de ibérico' : activeLang === 'EN' ? 'Iberian ham croquettes' : 'Croquettes de jambon'}
                  price="9,50 €"
                  description={activeLang === 'ES' ? 'Cremosas, 100% bellota' : activeLang === 'EN' ? 'Creamy, acorn-fed ham' : 'Crémeuses, pur ibérique'}
                  allergens={['🌾 Gluten', '🥛 Lácteos']}
                />
                <PreviewDish
                  isDark={isDarkPreview}
                  title={activeLang === 'ES' ? 'Berenjena a la llama' : activeLang === 'EN' ? 'Charred eggplant' : 'Aubergine grillée'}
                  price="8,50 €"
                  description={activeLang === 'ES' ? 'Miel de caña y queso feta' : activeLang === 'EN' ? 'Sugar cane honey & feta' : 'Miel de canne et feta'}
                  allergens={['🥛 Lácteos', '🍯 Mostaza']}
                />
              </div>
            )}

            {activeTab === 'bebidas' && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-[10px] font-bold uppercase tracking-[.11em] text-[var(--kitcho-orange)]">
                  {activeLang === 'ES' ? 'Vinos Tintos (D.O. Rioja)' : activeLang === 'EN' ? 'Red Wines' : 'Vins Rouges'}
                </p>
                <PreviewDish
                  isDark={isDarkPreview}
                  title="Marqués de Riscal Reserva"
                  price="22,00 €"
                  description="Tempranillo, 24 meses en barrica"
                  allergens={['🍷 Sulfitos']}
                />
                <PreviewDish
                  isDark={isDarkPreview}
                  title="Cerveza Artesana Kitcho"
                  price="3,80 €"
                  description="IPA local tirada en copa de cristal"
                  allergens={['🌾 Gluten']}
                />
              </div>
            )}

            {activeTab === 'menu_dia' && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-[10px] font-bold uppercase tracking-[.11em] text-[var(--kitcho-orange)]">
                  {activeLang === 'ES' ? 'Menú Ejecutivo (14,50 €)' : activeLang === 'EN' ? 'Daily Menu (14.50 €)' : 'Menu du Jour (14,50 €)'}
                </p>
                <PreviewDish
                  isDark={isDarkPreview}
                  title={activeLang === 'ES' ? '1º Salmorejo cordobés' : activeLang === 'EN' ? '1st Tomato soup' : '1er Soupe tomate'}
                  price="Incluido"
                  description="Con huevo duro y virutas de jamón"
                  allergens={['🥚 Huevo', '🌾 Gluten']}
                />
                <PreviewDish
                  isDark={isDarkPreview}
                  title={activeLang === 'ES' ? '2º Lubina a la espalda' : activeLang === 'EN' ? '2nd Grilled sea bass' : '2eme Bar grillé'}
                  price="Incluido"
                  description="Con patatas panadera y refrito de ajos"
                  allergens={['🐟 Pescado']}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewDish({
  title,
  price,
  description,
  allergens,
  isDark,
}: {
  title: string;
  price: string;
  description: string;
  allergens?: string[];
  isDark: boolean;
}) {
  return (
    <div className={`rounded-xl border p-2.5 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</p>
          <p className={`mt-0.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
          {allergens && allergens.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {allergens.map((alg) => (
                <span
                  key={alg}
                  className={`rounded px-1.5 py-0.5 text-[9px] font-semibold border ${
                    isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {alg}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs font-bold text-orange-600 shrink-0">{price}</span>
      </div>
    </div>
  );
}
