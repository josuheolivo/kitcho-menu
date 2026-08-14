'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Restaurant, MenuData, EMPTY_MENU, ensureMenuStructure } from '@/lib/types';
import { isTrialActive, getTrialDaysRemaining, formatTrialDate } from '@/lib/trial';
import AdminPanel from '@/components/AdminPanel';
import TrialBanner from '@/components/TrialBanner';
import BrandMark from '@/components/BrandMark';
import { ArrowUpRightIcon, CheckIcon, SparkIcon } from '@/components/Icons';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuData>(EMPTY_MENU);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: restaurantData } = await supabase.from('restaurants').select('*').eq('owner_id', session.user.id).single();
      if (!restaurantData) { router.push('/auth/callback'); return; }
      setRestaurant(restaurantData);
      const { data: menuData } = await supabase.from('menus').select('data').eq('restaurant_id', restaurantData.id).single();
      if (menuData?.data) setMenu(ensureMenuStructure(menuData.data as MenuData));
      setLoading(false);
    };
    loadData();
  }, [router]);

  const handleSave = async (newMenu: MenuData, newLogoUrl?: string | null) => {
    if (!restaurant) return;
    setSaving(true);
    setSaved(false);
    setSaveError(null);

    // 1. Save menu JSON
    const { error: menuError } = await supabase
      .from('menus')
      .update({ data: newMenu, updated_at: new Date().toISOString() })
      .eq('restaurant_id', restaurant.id);

    if (menuError) {
      setSaving(false);
      setSaveError(menuError.message);
      return;
    }

    // 2. Sync name & logo_url with restaurants table
    const updatedName = newMenu.restaurantName || restaurant.name;
    const logoToSave = newLogoUrl !== undefined ? newLogoUrl : restaurant.logo_url;

    if (updatedName !== restaurant.name || logoToSave !== restaurant.logo_url) {
      const { error: restError } = await supabase
        .from('restaurants')
        .update({
          name: updatedName,
          logo_url: logoToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', restaurant.id);

      if (restError) {
        setSaving(false);
        setSaveError(restError.message);
        return;
      }

      setRestaurant((prev) => (prev ? { ...prev, name: updatedName, logo_url: logoToSave } : null));
    }

    setMenu(newMenu);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f7f7f4]"><div className="text-center animate-fade-in"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--kitcho-orange)] text-white"><SparkIcon className="h-6 w-6" /></span><p className="mt-4 text-sm font-bold text-[var(--text-secondary)]">Preparando tu espacio…</p></div></div>;
  if (!restaurant) return null;

  const trialActive = isTrialActive(restaurant.trial_ends_at);
  const daysRemaining = getTrialDaysRemaining(restaurant.trial_ends_at);
  const publicUrl = `${window.location.origin}/menu/${restaurant.slug}`;

  const handleDownloadQr = async () => {
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

  return (
    <div className="min-h-screen bg-[#f7f7f4]">
      {!trialActive && <TrialBanner message="Tu prueba ha terminado. Tu menú sigue visible para tus clientes." />}
      {trialActive && daysRemaining <= 3 && <TrialBanner message={`Tu prueba termina en ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}.`} />}
      <header className="border-b border-[var(--border)] bg-white/90 backdrop-blur-xl"><div className="container flex min-h-[4.5rem] items-center justify-between gap-3"><BrandMark /><div className="flex items-center gap-1 sm:gap-2"><a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm hidden sm:inline-flex">Ver menú <ArrowUpRightIcon /></a><button onClick={handleLogout} className="btn btn-ghost btn-sm">Salir</button></div></div></header>
      <main className="container pb-16 pt-8 sm:pt-12">
        <div className="mb-8 flex flex-col gap-6 border-b border-[var(--border)] pb-8 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-fade-in"><p className="eyebrow mb-3">Panel de edición</p><h1 className="display text-4xl text-[var(--kitcho-charcoal)] sm:text-5xl">{restaurant.name || menu.restaurantName || 'Tu restaurante'}</h1><p className="mt-3 max-w-xl text-[var(--text-secondary)]">Organiza lo que tus clientes descubrirán al escanear tu código QR.</p></div>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full sm:hidden">Ver menú público <ArrowUpRightIcon /></a>
        </div>
        
        {/* Status Cards & QR Download Card */}
        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="card p-5 sm:p-6"><div className="flex items-start gap-4"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${trialActive ? 'bg-[#effaf3] text-[#237a49]' : 'bg-[#fff0e8] text-[var(--kitcho-orange)]'}`}><SparkIcon className="h-5 w-5" /></span><div><p className="text-sm font-bold text-[var(--kitcho-charcoal)]">{trialActive ? 'Periodo de prueba activo' : 'Periodo de prueba finalizado'}</p><p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{trialActive ? `Tu acceso de prueba termina el ${formatTrialDate(restaurant.trial_ends_at)}.` : `Tu periodo de prueba terminó el ${formatTrialDate(restaurant.trial_ends_at)}.`}</p></div></div></div>
          <div className="card flex items-center gap-4 p-5 sm:p-6"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${trialActive ? 'bg-[#fff8db] text-[#9a6700]' : 'bg-[#f1f2ef] text-[var(--text-secondary)]'}`}><CheckIcon className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[.1em] text-[var(--kitcho-gray-dark)]">Estado</p><p className="mt-1 font-bold text-[var(--kitcho-charcoal)]">{trialActive ? `${daysRemaining} días restantes` : 'Prueba finalizada'}</p></div></div>
          
          {/* Card Descargar QR */}
          <div className="card p-5 sm:p-6 flex flex-col justify-between bg-gradient-to-br from-white to-[#fafafa]">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`}
                alt="QR Code"
                className="h-12 w-12 rounded-lg border border-[var(--border)] p-1 bg-white"
              />
              <div>
                <p className="text-sm font-bold text-[var(--kitcho-charcoal)]">Código QR para Mesas</p>
                <p className="text-xs text-[var(--text-secondary)]">PNG Alta Resolución (1000x1000px)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadQr}
              className="btn btn-outline btn-sm w-full font-bold text-[var(--kitcho-orange-dark)] hover:bg-[#fff0e8]"
            >
              📥 Descargar QR (PNG HD)
            </button>
          </div>
        </section>
        <AdminPanel
          menu={menu}
          restaurantLogoUrl={restaurant.logo_url}
          onSave={handleSave}
          saving={saving}
          saved={saved}
          saveError={saveError}
        />
      </main>
    </div>
  );
}
