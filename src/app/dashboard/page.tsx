'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Restaurant, MenuData, EMPTY_MENU } from '@/lib/types';
import { isTrialActive, getTrialDaysRemaining, formatTrialDate } from '@/lib/trial';
import AdminPanel from '@/components/AdminPanel';
import TrialBanner from '@/components/TrialBanner';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuData>(EMPTY_MENU);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', session.user.id)
        .single();

      if (!restaurantData) {
        router.push('/auth/callback');
        return;
      }

      setRestaurant(restaurantData);

      const { data: menuData } = await supabase
        .from('menus')
        .select('data')
        .eq('restaurant_id', restaurantData.id)
        .single();

      if (menuData?.data) {
        setMenu(menuData.data as MenuData);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleSave = async (newMenu: MenuData) => {
    if (!restaurant) return;
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from('menus')
      .update({ data: newMenu, updated_at: new Date().toISOString() })
      .eq('restaurant_id', restaurant.id);

    setSaving(false);

    if (!error) {
      setMenu(newMenu);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--kitcho-gray)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[var(--kitcho-orange)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--text-secondary)] text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  const trialActive = isTrialActive(restaurant.trial_ends_at);
  const daysRemaining = getTrialDaysRemaining(restaurant.trial_ends_at);

  return (
    <div className="min-h-screen bg-[var(--kitcho-gray)]">
      {/* Trial banners */}
      {!trialActive && (
        <TrialBanner message="Tu prueba ha expirado. El menú sigue funcionando con banner." />
      )}
      {trialActive && daysRemaining <= 3 && (
        <TrialBanner message={`Tu prueba termina en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}.`} />
      )}

      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-40 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[var(--kitcho-orange)] flex items-center justify-center font-bold text-white text-xs">K</div>
              <span className="font-bold text-sm hidden sm:inline text-[var(--kitcho-charcoal)]">Kitcho</span>
            </Link>
            <div className="h-5 w-px bg-[var(--border)]"></div>
            <span className="text-[var(--text-secondary)] text-sm truncate max-w-[150px]">
              {restaurant.name || 'Mi Restaurante'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              Ver menú ↗
            </a>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container py-6">
        {/* Trial status card */}
        <div className="card mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base mb-0.5">
                {trialActive ? '🎉 Período de prueba activo' : '⏰ Prueba finalizada'}
              </h2>
              <p className="text-[var(--text-secondary)] text-sm">
                {trialActive
                  ? `Termina el ${formatTrialDate(restaurant.trial_ends_at)}`
                  : `Finalizó el ${formatTrialDate(restaurant.trial_ends_at)}`
                }
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                trialActive
                  ? daysRemaining <= 3
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {trialActive ? `${daysRemaining} días restantes` : 'Expirado'}
            </div>
          </div>
        </div>

        {/* Admin Panel */}
        <AdminPanel
          restaurantId={restaurant.id}
          menu={menu}
          onSave={handleSave}
          saving={saving}
          saved={saved}
        />
      </main>
    </div>
  );
}
