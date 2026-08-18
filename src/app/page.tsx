'use client';

import { useState, useRef } from 'react';
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
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const features = [
  {
    title: 'Múltiples Cartas y Galería Destacada',
    description: 'Organiza Comidas, Vinos o Menú del Día y destaca tus platos estrella con carrusel animado GSAP.',
    icon: MenuIcon,
    className: 'md:col-span-2',
    tag: 'Nuevo V2.5 🌟',
  },
  {
    title: 'Fotografías de Platos en WebP',
    description: 'Sube fotos de tus platos comprimidas automáticamente a WebP (<100KB) para un escaneo ultra-rápido.',
    icon: SparkIcon,
    className: '',
    tag: 'Ultra Rápido 📷',
  },
  {
    title: 'Adaptación Regional & Tasa Oficial BCV',
    description: 'Soporte automático para Venezuela y mercado global con actualización en tiempo real de la tasa oficial BCV.',
    icon: GlobeIcon,
    className: '',
    tag: 'Auto Sync BCV 🇻🇪',
  },
  {
    title: 'Precios en Doble Moneda ($ / Bs. / €)',
    description: 'Tus comensales eligen cómo ver los precios: en Dólares, Bolívares o Euros con conversión en vivo.',
    icon: CheckIcon,
    className: '',
    tag: 'Doble Moneda 💵',
  },
  {
    title: 'Traducción IA & Modo Simplificado',
    description: 'Traduce a 6 idiomas con un solo toque o simplifica la UI a un solo idioma sin curvas de aprendizaje.',
    icon: PenIcon,
    className: 'md:col-span-2',
    tag: 'Inteligencia IA ✨',
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current.querySelectorAll('.hero-anim'), {
      y: 24,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: 'power2.out',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden bg-[#f7f7f4]">
      {/* Navegación */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[#f7f7f4]/90 backdrop-blur-xl">
        <div className="container flex h-[4.5rem] items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm">Iniciar sesión</Link>
            <Link href="/register" className="btn btn-primary btn-sm font-bold">Crear mi menú <ArrowUpRightIcon /></Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative border-b border-[var(--border)] bg-[#f7f7f4] pb-16 pt-12 sm:pb-24 sm:pt-16">
          <div className="pointer-events-none absolute -right-28 top-0 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-amber-100/60 blur-3xl" />

          <div className="container relative grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
            <div className="max-w-2xl">
              <div className="hero-anim inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-800 shadow-sm mb-6 animate-pulse-subtle">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-orange-500 text-white text-[10px]">✨</span>
                <span>Plataforma de Menús Digitales QR de Nueva Generación</span>
              </div>

              <h1 className="hero-anim display max-w-xl text-[clamp(3.2rem,7.5vw,5.5rem)] text-[var(--kitcho-charcoal)] leading-[1.05]">
                La carta digital que <em className="text-[var(--kitcho-orange)]">vende por ti.</em>
              </h1>

              <p className="hero-anim mt-7 max-w-xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
                Fotografías de platos en WebP, Galería Destacada animada, Tasa Oficial BCV automatizada, Doble Moneda ($ / Bs / €) y traducción con IA en 6 idiomas.
              </p>

              <div className="hero-anim mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="btn btn-primary btn-lg font-bold group shadow-md">
                  Empieza gratis 15 días <ArrowUpRightIcon className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link href="#como-funciona" className="btn btn-outline btn-lg font-bold">Ver cómo funciona</Link>
              </div>

              <div className="hero-anim mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[var(--text-secondary)]">
                {['Fotos de Platos WebP', 'Tasa Oficial BCV Auto Sync', 'Doble Moneda $ / Bs', '14 Alérgenos UE'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-[var(--kitcho-orange)]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Preview Mockup */}
            <div className="hero-anim">
              <InteractiveMenuPreview />
            </div>
          </div>
        </section>

        {/* Métricas Clave */}
        <section className="border-b border-[var(--border)] bg-white py-10">
          <div className="container grid gap-6 text-center sm:grid-cols-4">
            <Metric label="Fotos de Platos" value="Compresión WebP" highlight="⚡ Carga instantánea" />
            <Metric label="Tasa BCV Oficial" value="Actualizada 24/7" highlight="🇻🇪 Auto Sincronizada" />
            <Metric label="Gestión de Monedas" value="Dólares / Bolívares / €" highlight="💵 Doble Moneda" />
            <Metric label="Para tus clientes" value="Sin descargas" highlight="📱 Directo al QR" />
          </div>
        </section>

        {/* Características */}
        <section className="bg-white py-20 sm:py-28">
          <div className="container">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">Potencia y Simplicidad</p>
              <h2 className="display text-4xl text-[var(--kitcho-charcoal)] sm:text-5xl">
                Diseñado para destacar la gastronomía de tu restaurante.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">
                Todo lo necesario para cumplir normativas locales e internacionales y enamorar a tus comensales desde el primer escaneo.
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
                    <span className="rounded-full bg-orange-100 dark:bg-orange-950/80 border border-orange-200 px-2.5 py-1 text-[11px] font-extrabold text-orange-800 dark:text-orange-300">
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
              <h2 className="display text-4xl sm:text-5xl">Una carta moderna en 3 sencillos pasos.</h2>
              <p className="mt-5 max-w-md text-lg leading-8 text-white/65">
                Configura la moneda de tu región, sube tus platos con foto y comparte tu código QR en minutos.
              </p>
            </div>
            <ol className="grid gap-5">
              {[
                ['01', 'Crea tu cuenta', 'Regístrate en 30 segundos con el nombre y la región de tu restaurante.'],
                ['02', 'Sube tus platos y fotos', 'Añade fotografías optimizadas WebP y configura el precio en $ / Bs / €.'],
                ['03', 'Publica tu código QR', 'Imprime tu código QR para la mesa y permite que tus clientes disfruten una experiencia visual impecable.'],
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
              <Link href="/register" className="btn btn-lg mt-8 border-white bg-white text-[var(--kitcho-orange-dark)] hover:bg-orange-50 shadow-lg font-bold">
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
          <p>Kitcho Menu · Plataforma de cartas digitales para restaurantes.</p>
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
  const [activeTab, setActiveTab] = useState<'comida' | 'bebidas' | 'destacados'>('destacados');
  const [currencyMode, setCurrencyMode] = useState<'both' | 'usd' | 'ves'>('both');
  const [isDarkPreview, setIsDarkPreview] = useState(false);

  // Tasa BCV de demostración
  const demoBcvRate = 40.0;

  return (
    <div className="relative mx-auto w-full max-w-md animate-scale-in lg:max-w-lg">
      <div className="absolute -left-5 top-8 z-10 hidden rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-bold text-[var(--text-secondary)] shadow-md sm:block animate-float">
        📷 Fotos WebP & GSAP
      </div>

      <div className="absolute -right-3 bottom-10 z-10 hidden rounded-xl bg-[var(--kitcho-yellow)] px-3.5 py-2 text-xs font-bold text-[var(--kitcho-charcoal)] shadow-md sm:block animate-float" style={{ animationDelay: '2s' }}>
        🇻🇪 Tasa BCV 40.00 Bs/USD
      </div>

      {/* Outer Phone Shell */}
      <div className="rounded-[2.2rem] border-[9px] border-[#172033] bg-[#172033] p-2 shadow-[0_28px_60px_rgba(23,32,51,.28)]">
        <div className={`overflow-hidden rounded-[1.6rem] transition-colors duration-300 ${isDarkPreview ? 'bg-slate-950 text-slate-100' : 'bg-[#f7f7f4] text-slate-900'}`}>
          
          {/* Header */}
          <div className="bg-[#172033] px-5 pb-5 pt-6 text-center text-white relative">
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
            <p className="mt-0.5 text-xs text-white/60">Cocina de mercado & especialidades</p>
          </div>

          {/* Interactive Bar */}
          <div className={`-mt-2 rounded-t-[1.4rem] px-4 pb-4 pt-3 transition-colors ${isDarkPreview ? 'bg-slate-950' : 'bg-[#f7f7f4]'}`}>
            
            {/* Currency Selector Chips ($ / Bs / Both) */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/90 rounded-lg p-1 text-[10px] font-bold border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrencyMode('both')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    currencyMode === 'both' ? 'bg-amber-500 text-white font-extrabold' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  $ / Bs
                </button>
                <button
                  type="button"
                  onClick={() => setCurrencyMode('usd')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    currencyMode === 'usd' ? 'bg-amber-500 text-white font-extrabold' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Solo $
                </button>
                <button
                  type="button"
                  onClick={() => setCurrencyMode('ves')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    currencyMode === 'ves' ? 'bg-amber-500 text-white font-extrabold' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Solo Bs
                </button>
              </div>

              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                BCV: 40.00 Bs
              </span>
            </div>

            {/* Menu Collection Tabs */}
            <div className="mb-3 flex justify-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('destacados')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  activeTab === 'destacados'
                    ? 'bg-orange-600 text-white'
                    : isDarkPreview
                    ? 'text-slate-400'
                    : 'text-slate-600'
                }`}
              >
                🌟 Galería Chef
              </button>
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
                Carta Comidas
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
                Bebidas
              </button>
            </div>

            {/* Content Mockup */}
            {activeTab === 'destacados' && (
              <div className="space-y-2 animate-fade-in">
                {/* Hero Showcase Card */}
                <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-slate-900 text-white p-3 flex flex-col justify-end shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                  <span className="absolute top-2 left-2 rounded-full bg-orange-600 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white shadow-sm">
                    🌟 Plato Destacado
                  </span>
                  <div className="relative z-10 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xs font-extrabold">Solomillo al Grill</p>
                      <p className="text-[10px] text-slate-300">Con salsa de champiñones y papas rústicas</p>
                    </div>
                    <div className="text-right shrink-0 bg-orange-600/90 rounded-lg px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                      {currencyMode === 'ves' ? '560.00 Bs.' : currencyMode === 'usd' ? '$ 14.00' : '$ 14.00 / 560 Bs.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comida' && (
              <div className="space-y-2 animate-fade-in">
                <PreviewDish
                  isDark={isDarkPreview}
                  title="Croquetas de ibérico"
                  priceUsd="9,50 $"
                  bcvRate={demoBcvRate}
                  currencyMode={currencyMode}
                  description="Cremosas, 100% bellota con toque de alioli"
                  allergens={['🌾 Gluten', '🥛 Lácteos']}
                  hasImage
                />
                <PreviewDish
                  isDark={isDarkPreview}
                  title="Berenjena a la llama"
                  priceUsd="8,50 $"
                  bcvRate={demoBcvRate}
                  currencyMode={currencyMode}
                  description="Miel de caña y queso feta rallado"
                  allergens={['🥛 Lácteos']}
                />
              </div>
            )}

            {activeTab === 'bebidas' && (
              <div className="space-y-2 animate-fade-in">
                <PreviewDish
                  isDark={isDarkPreview}
                  title="Sangría de Autor"
                  priceUsd="12,00 $"
                  bcvRate={demoBcvRate}
                  currencyMode={currencyMode}
                  description="Vino tinto reserva, frutas de estación y canela"
                  allergens={['🍷 Sulfitos']}
                  hasImage
                />
                <PreviewDish
                  isDark={isDarkPreview}
                  title="Cerveza Artesana Kitcho"
                  priceUsd="3,80 $"
                  bcvRate={demoBcvRate}
                  currencyMode={currencyMode}
                  description="IPA tirada en copa de cristal"
                  allergens={['🌾 Gluten']}
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
  priceUsd,
  description,
  allergens,
  isDark,
  bcvRate,
  currencyMode,
  hasImage,
}: {
  title: string;
  priceUsd: string;
  description: string;
  allergens?: string[];
  isDark: boolean;
  bcvRate: number;
  currencyMode: 'both' | 'usd' | 'ves';
  hasImage?: boolean;
}) {
  const numericPrice = Number(priceUsd.replace(',', '.').replace('$', '').trim());
  const vesPrice = numericPrice * bcvRate;
  const formattedVes = vesPrice.toFixed(2);

  return (
    <div className={`rounded-xl border p-2.5 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start gap-2.5">
        {hasImage && (
          <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-100 dark:bg-slate-800 grid place-items-center text-xs font-bold text-orange-600 shadow-xs border border-orange-200 dark:border-slate-700">
            🖼️
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <p className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</p>
            <div className="text-right shrink-0 text-[10px] font-bold text-orange-600">
              {currencyMode === 'both' && <span>{priceUsd} / {formattedVes} Bs.</span>}
              {currencyMode === 'usd' && <span>{priceUsd}</span>}
              {currencyMode === 'ves' && <span>{formattedVes} Bs.</span>}
            </div>
          </div>
          <p className={`mt-0.5 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
          {allergens && allergens.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {allergens.map((alg) => (
                <span
                  key={alg}
                  className={`rounded px-1 py-0.2 text-[8px] font-semibold border ${
                    isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {alg}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
