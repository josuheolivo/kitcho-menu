'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MenuData, ensureMenuStructure, EMPTY_TRANSLATABLE } from '@/lib/types';
import { saveMenu } from '@/lib/actions';
import { getTrialDaysRemaining, formatTrialDate } from '@/lib/trial';
import AdminPanel from '@/components/AdminPanel';
import TrialBanner from '@/components/TrialBanner';
import BrandMark from '@/components/BrandMark';
import A5QrPosterModal from '@/components/A5QrPosterModal';
import { ArrowUpRightIcon, SparkIcon, CheckIcon } from '@/components/Icons';

interface RestaurantRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  trial_ends_at: string;
  created_at: string;
  menu_json: MenuData | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isA5ModalOpen, setIsA5ModalOpen] = useState(false);

  // Call useMemo BEFORE any conditional early returns (React Rules of Hooks)
  const menu = useMemo(
    () =>
      ensureMenuStructure(
        restaurant?.menu_json || {
          restaurantName: restaurant?.name || '',
          tagline: EMPTY_TRANSLATABLE,
          version: 1,
        }
      ),
    [restaurant?.menu_json, restaurant?.name]
  );

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error || !data) {
        router.push('/register');
        return;
      }

      setRestaurant(data);
      setLoading(false);
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSave = async (updatedMenu: MenuData) => {
    if (!restaurant) return;
    setSaving(true);
    setSaved(false);
    setSaveError(null);

    const result = await saveMenu(restaurant.id, updatedMenu);

    if (result.success) {
      setSaved(true);
      setRestaurant((prev) => (prev ? { ...prev, menu_json: updatedMenu } : prev));
      setTimeout(() => setSaved(false), 3000);
    } else {
      setSaveError((result as { success: boolean; error?: string }).error || 'Error desconocido al guardar');
    }

    setSaving(false);
  };

  const handleDownloadQr = async () => {
    if (!restaurant) return;
    const publicUrl = `${window.location.origin}/menu/${restaurant.slug}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(publicUrl)}`;
    const response = await fetch(qrApiUrl);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `qr-kitcho-${restaurant.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f7f4]">
        <div className="text-center">
          <BrandMark className="justify-center" />
          <p className="mt-4 text-sm text-[var(--text-secondary)]">Cargando tu panel de administración…</p>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  const daysRemaining = getTrialDaysRemaining(restaurant.trial_ends_at);
  const trialActive = daysRemaining > 0;
  const publicUrl = `${window.location.origin}/menu/${restaurant.slug}`;

  return (
    <div className="min-h-screen bg-[#f7f7f4]">
      {!trialActive && <TrialBanner message="Tu prueba ha terminado. Tu menú sigue visible para tus clientes." />}
      {trialActive && daysRemaining <= 3 && <TrialBanner message={`Tu prueba termina en ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}.`} />}

      <header className="border-b border-[var(--border)] bg-white/90 backdrop-blur-xl">
        <div className="container flex min-h-[4.5rem] items-center justify-between gap-3">
          <BrandMark />
          <div className="flex items-center gap-1 sm:gap-2">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm hidden sm:inline-flex">
              Ver menú <ArrowUpRightIcon />
            </a>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">Salir</button>
          </div>
        </div>
      </header>

      <main className="container pb-16 pt-8 sm:pt-12">
        <div className="mb-8 flex flex-col gap-6 border-b border-[var(--border)] pb-8 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-fade-in">
            <p className="eyebrow mb-3">Panel de edición</p>
            <h1 className="display text-4xl text-[var(--kitcho-charcoal)] sm:text-5xl">
              {restaurant.name || menu.restaurantName || 'Tu restaurante'}
            </h1>
            <p className="mt-3 max-w-xl text-[var(--text-secondary)]">
              Organiza lo que tus clientes descubrirán al escanear tu código QR.
            </p>
          </div>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full sm:hidden">
            Ver menú público <ArrowUpRightIcon />
          </a>
        </div>

        {/* Status Cards & QR Stand Card */}
        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="card p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${trialActive ? 'bg-[#effaf3] text-[#237a49]' : 'bg-[#fff0e8] text-[var(--kitcho-orange)]'}`}>
                <SparkIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--kitcho-charcoal)]">
                  {trialActive ? 'Periodo de prueba activo' : 'Periodo de prueba finalizado'}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  {trialActive
                    ? `Tu acceso de prueba termina el ${formatTrialDate(restaurant.trial_ends_at)}.`
                    : `Tu periodo de prueba terminó el ${formatTrialDate(restaurant.trial_ends_at)}.`}
                </p>
              </div>
            </div>
          </div>

          <div className="card flex items-center gap-4 p-5 sm:p-6">
            <span className={`grid h-11 w-11 place-items-center rounded-2xl ${trialActive ? 'bg-[#fff8db] text-[#9a6700]' : 'bg-[#f1f2ef] text-[var(--text-secondary)]'}`}>
              <CheckIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.1em] text-[var(--kitcho-gray-dark)]">Estado</p>
              <p className="mt-1 font-bold text-[var(--kitcho-charcoal)]">
                {trialActive ? `${daysRemaining} días restantes` : 'Prueba finalizada'}
              </p>
            </div>
          </div>

          {/* Card Cartel de Mesas A5 & QR */}
          <div className="card p-5 sm:p-6 flex flex-col justify-between bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`}
                alt="QR Code"
                className="h-12 w-12 rounded-lg border border-orange-200 p-1 bg-white shadow-sm"
              />
              <div>
                <p className="text-sm font-bold text-[var(--kitcho-charcoal)]">Cartel A5 para Mesas (QR)</p>
                <p className="text-xs text-[var(--text-secondary)]">Impresión A5 (148x210mm) con Logo y Branding</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsA5ModalOpen(true)}
                className="btn btn-primary btn-sm w-full font-bold shadow-sm"
              >
                🎨 Diseñar Cartel A5 (Impresión)
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="btn btn-ghost btn-sm w-full text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                📥 Solo Código QR (PNG HD)
              </button>
            </div>
          </div>
        </section>

        <AdminPanel
          key={`${restaurant.id}_${restaurant.menu_json?.version || 1}`}
          menu={menu}
          restaurantLogoUrl={restaurant.logo_url}
          onSave={handleSave}
          saving={saving}
          saved={saved}
          saveError={saveError}
        />
      </main>

      {/* Modal Diseñador de Cartel A5 para Imprimir */}
      <A5QrPosterModal
        isOpen={isA5ModalOpen}
        onClose={() => setIsA5ModalOpen(false)}
        restaurantName={restaurant.name || menu.restaurantName || 'Tu restaurante'}
        logoUrl={restaurant.logo_url}
        tagline={menu.tagline ? (typeof menu.tagline === 'string' ? menu.tagline : menu.tagline.es || menu.tagline.en) : undefined}
        primaryColor={menu.primaryColor || '#ea580c'}
        publicUrl={publicUrl}
        slug={restaurant.slug}
      />
    </div>
  );
}
