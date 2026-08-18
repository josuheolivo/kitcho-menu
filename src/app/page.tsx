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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        'name': 'Kitcho Menu',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All (Web App / Cloud SaaS)',
        'offers': {
          '@type': 'Offer',
          'price': '100.00',
          'priceCurrency': 'USD',
          'priceValidUntil': '2027-12-31',
          'availability': 'https://schema.org/InStock',
          'description': 'Plan Anual VIP Kitcho Menu con sincronización BCV y Diseñador A5',
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'reviewCount': '48',
        },
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': '¿Cómo se actualiza la tasa del dólar en el menú?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Kitcho Menu se conecta en tiempo real con la tasa oficial del Banco Central de Venezuela (BCV), actualizando automáticamente los precios en Bolívares sin que tengas que modificarlos a mano.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Cuánto tiempo toma digitalizar mi menú físico?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Gracias a nuestro motor de IA integrado (Google Gemini Flash), solo debes tomarle una foto o subir el PDF de tu carta actual y el sistema la estructura en menos de 30 segundos.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Cómo imprimo los códigos QR para las mesas?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Kitcho incluye un diseñador integrado que genera habladores de mesa en formato A5 en alta definición (300 DPI) con tu logo y colores corporativos, listos para enviar a la imprenta o colocar en soportes acrílicos.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Qué métodos de pago aceptan para la suscripción?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Aceptamos Pago Móvil (a tasa oficial BCV), Zelle, Binance Pay (USDT) y tarjetas de débito/crédito internacionales.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden bg-[#f7f7f4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

              <h1 className="hero-anim display max-w-xl text-[clamp(2.8rem,6.5vw,4.5rem)] text-[var(--kitcho-charcoal)] leading-[1.05]">
                El Menú Digital QR con IA y Tasa BCV que <em className="text-[var(--kitcho-orange)]">multiplica las ventas de tu restaurante en Venezuela.</em>
              </h1>

              <p className="hero-anim mt-7 max-w-xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
                Crea tu carta digital interactiva en 30 segundos con IA. Actualización automática de Tasa BCV, doble moneda ($/Bs), habladores A5 y 15 días gratis sin tarjeta.
              </p>

              <div className="hero-anim mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="btn btn-primary btn-lg font-bold group shadow-md">
                  Empieza gratis 15 días <ArrowUpRightIcon className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a href="#como-funciona" className="btn btn-outline btn-lg font-bold">Ver cómo funciona</a>
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
                ['02', 'Carga Mágica con IA', 'Tómale una foto a tu menú físico o PDF y nuestra IA Gemini lo digitaliza y estructura por ti en solo 30 segundos.'],
                ['03', 'Imprime tus Habladores A5', 'El diseñador integrado genera tus carteles QR en alta resolución listos para imprimir y exhibir en las mesas.'],
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

        {/* Sección de Precios */}
        <section id="precios" className="py-20 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-600 dark:text-orange-500 font-semibold uppercase tracking-wider text-sm">Planes Transparentes</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--kitcho-charcoal)] dark:text-white mt-2">Invierte en tu restaurante, ahorra en imprenta.</h2>
            <p className="text-[var(--text-secondary)] dark:text-slate-400 mt-3 max-w-xl mx-auto">Elige el plan que mejor se adapte a tu local. Cancela cuando quieras o aprovecha la Oferta VIP de Lanzamiento.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Mensual */}
            <div className="bg-white border border-[var(--border)] rounded-2xl p-8 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-[var(--kitcho-charcoal)]">Plan Mensual Flex</h3>
                <p className="text-[var(--text-secondary)] text-sm mt-1">Ideal para probar mes a mes sin compromisos.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-[var(--kitcho-charcoal)]">$10</span>
                  <span className="text-[var(--text-secondary)] ml-2">USD / mes</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-[var(--text-secondary)] font-medium">
                  <li className="flex items-center">✓ Menú QR digital ilimitado</li>
                  <li className="flex items-center">✓ Sincronización Tasa BCV automática</li>
                  <li className="flex items-center">✓ Fotos comprimidas en WebP</li>
                  <li className="flex items-center">✓ 14 Alérgenos y 6 Idiomas</li>
                </ul>
              </div>
              <Link href="/register" className="mt-8 block text-center py-3 px-6 rounded-xl border border-[var(--border-strong)] text-[var(--kitcho-charcoal)] font-bold hover:bg-[var(--kitcho-gray)] transition shadow-sm">
                Empezar 15 días gratis
              </Link>
            </div>

            {/* Plan Anual VIP (Destacado) */}
            <div className="bg-gradient-to-b from-[#3a1505] to-[#1a202c] border-2 border-orange-500 rounded-2xl p-8 flex flex-col justify-between relative shadow-2xl shadow-orange-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full whitespace-nowrap">
                🔥 Oferta VIP Lanzamiento Venezuela
              </div>
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h3 className="text-xl font-bold text-white">Plan Anual VIP</h3>
                  <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap">Ahorras $20 + 5 Bonos</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">El plan preferido por restaurantes de éxito.</p>
                <div className="mt-6 flex items-baseline flex-wrap gap-2">
                  <span className="text-5xl font-extrabold text-white">$100</span>
                  <span className="text-slate-400">USD / año</span>
                  <span className="text-xs text-orange-400 font-bold">($8.33/mes)</span>
                </div>
                
                {/* Stack de Bonos */}
                <div className="mt-6 pt-5 border-t border-slate-700/50">
                  <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-3">🎁 STACK DE BONOS VIP INCLUIDOS:</p>
                  <ul className="space-y-3 text-sm text-slate-200">
                    <li className="flex items-start gap-2"><span>✨</span> <span><strong>Bono 1:</strong> Digitalización asistida con IA de tu carta actual.</span></li>
                    <li className="flex items-start gap-2"><span>🎨</span> <span><strong>Bono 2:</strong> Diseñador y descarga de Habladores A5 HD.</span></li>
                    <li className="flex items-start gap-2"><span>🇻🇪</span> <span><strong>Bono 3:</strong> Módulo BCV Auto-Sync en tiempo real.</span></li>
                    <li className="flex items-start gap-2"><span>🔒</span> <span><strong>Bono 4:</strong> Congelamiento de tarifa por 2 años.</span></li>
                    <li className="flex items-start gap-2"><span>💬</span> <span><strong>Bono 5:</strong> Soporte prioritario directo por WhatsApp.</span></li>
                  </ul>
                </div>
              </div>
              <Link href="/register?plan=vip-annual" className="mt-8 block text-center py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition shadow-lg shadow-orange-600/30">
                Reclamar Oferta VIP $100/Año
              </Link>
            </div>
          </div>
          
          <div className="text-center mt-10 p-4 rounded-xl bg-white/50 border border-[var(--border)] max-w-2xl mx-auto shadow-sm">
            <p className="text-sm font-bold text-[var(--kitcho-charcoal)] mb-2">Métodos de pago aceptados localmente:</p>
            <div className="flex flex-wrap justify-center items-center gap-3 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">
              <span className="px-3 py-1 rounded bg-green-100 text-green-800 border border-green-200">Pago Móvil (Tasa BCV)</span>
              <span className="px-3 py-1 rounded bg-[#f4e7ff] text-[#5c2499] border border-[#d6bbf0]">Zelle</span>
              <span className="px-3 py-1 rounded bg-[#fff8e1] text-[#f3ba2f] border border-[#ffe082]">Binance Pay</span>
              <span className="px-3 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">Tarjetas Int.</span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-20 sm:py-28">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <span className="eyebrow justify-center">Dudas Frecuentes</span>
              <h2 className="display text-3xl sm:text-5xl text-[var(--kitcho-charcoal)] mt-4">Todo lo que necesitas saber</h2>
            </div>
            
            <div className="space-y-4">
              <details className="group rounded-2xl border border-[var(--border)] bg-[#fcfcfa] p-6 open:bg-white open:shadow-md transition-all">
                <summary className="flex cursor-pointer items-center justify-between text-lg font-bold text-[var(--kitcho-charcoal)] outline-none">
                  ¿Cómo se actualiza la tasa del dólar en el menú?
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] pr-8">
                  Kitcho Menu se conecta en tiempo real con la tasa oficial del Banco Central de Venezuela (BCV), actualizando automáticamente todos tus precios en Bolívares. Tú configuras tus precios en USD y la app hace el cálculo en vivo, mostrándolos en doble moneda ($/Bs).
                </p>
              </details>

              <details className="group rounded-2xl border border-[var(--border)] bg-[#fcfcfa] p-6 open:bg-white open:shadow-md transition-all">
                <summary className="flex cursor-pointer items-center justify-between text-lg font-bold text-[var(--kitcho-charcoal)] outline-none">
                  ¿Cuánto tiempo toma digitalizar mi menú físico?
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] pr-8">
                  Gracias a nuestro motor de IA integrado (Google Gemini Flash), solo debes tomarle una foto o subir el PDF de tu carta actual y el sistema la transcribe y estructura automáticamente en menos de 30 segundos. ¡Adiós a teclear plato por plato!
                </p>
              </details>

              <details className="group rounded-2xl border border-[var(--border)] bg-[#fcfcfa] p-6 open:bg-white open:shadow-md transition-all">
                <summary className="flex cursor-pointer items-center justify-between text-lg font-bold text-[var(--kitcho-charcoal)] outline-none">
                  ¿Cómo imprimo los códigos QR para mis mesas?
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] pr-8">
                  El panel de administración cuenta con un diseñador integrado que genera habladores de mesa (formato A5 o tarjeta de visita) en alta definición (300 DPI) listos para llevar a la imprenta, ya personalizados con tu logo y tu color corporativo.
                </p>
              </details>

              <details className="group rounded-2xl border border-[var(--border)] bg-[#fcfcfa] p-6 open:bg-white open:shadow-md transition-all">
                <summary className="flex cursor-pointer items-center justify-between text-lg font-bold text-[var(--kitcho-charcoal)] outline-none">
                  ¿Qué métodos de pago aceptan para suscribirme?
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] pr-8">
                  Pensando 100% en el mercado nacional e internacional, aceptamos Pago Móvil (a tasa oficial BCV del día), Zelle, Binance Pay (USDT) y pago tradicional con tarjetas de débito o crédito Visa/Mastercard.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-[#f7f7f4] py-20 sm:py-28 relative">
          <div className="container">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172033] via-[#1e2a42] to-[#ea580c] px-6 py-12 text-center text-white sm:px-12 sm:py-16 shadow-2xl border border-slate-700/50">
              <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 90% 10%, #ea580c, transparent 50%)' }} />
              <p className="eyebrow justify-center !text-[#facc15] before:!bg-[#facc15]">Empieza hoy mismo</p>
              <h2 className="display mx-auto mt-4 max-w-2xl text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Que tu menú hable tan bien de ti como tu cocina.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base sm:text-lg leading-7 text-slate-200">
                Diseña tu carta digital hoy. Prueba Kitcho Menu durante 15 días sin compromiso.
              </p>
              <Link href="/register" className="btn btn-primary btn-lg mt-8 inline-flex items-center gap-2 font-bold shadow-xl hover:scale-105 transition-transform">
                Crear mi menú gratis <ArrowUpRightIcon />
              </Link>
            </div>
          </div>
        </section>

        {/* Sticky Bottom Action en Móvil */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 backdrop-blur-xl md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <Link href="/register?plan=vip-annual" className="btn btn-primary w-full font-bold shadow-md h-12 text-[15px] bg-orange-600 hover:bg-orange-700 border-orange-600">
            Crear Menú Gratis (15 Días) <ArrowUpRightIcon />
          </Link>
        </div>

        {/* Botón flotante de WhatsApp */}
        <a
          href="https://wa.me/584140000000?text=Hola,%20quiero%20más%20información%20sobre%20el%20Plan%20VIP%20de%20Kitcho%20Menu."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[4.5rem] md:bottom-6 right-4 md:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-transform hover:scale-110"
          aria-label="Hablar con un Asesor VIP por WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-white py-8 pb-20 md:pb-8">
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
