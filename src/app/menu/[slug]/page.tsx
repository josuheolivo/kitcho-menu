'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MenuData, EMPTY_MENU } from '@/lib/types';
import { isTrialActive } from '@/lib/trial';
import MenuPublic from '@/components/MenuPublic';

export default function PublicMenuPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [menu, setMenu] = useState<MenuData>(EMPTY_MENU);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const loadMenu = async () => {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!restaurant) {
        setLoading(false);
        return;
      }

      setRestaurantName(restaurant.name || 'Restaurante');
      setExpired(!isTrialActive(restaurant.trial_ends_at));

      const { data: menuData } = await supabase
        .from('menus')
        .select('data')
        .eq('restaurant_id', restaurant.id)
        .single();

      if (menuData?.data) {
        setMenu(menuData.data as MenuData);
      }

      setLoading(false);
    };

    loadMenu();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--kitcho-gray)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[var(--kitcho-orange)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--text-secondary)] text-sm">Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <MenuPublic
      menu={menu}
      restaurantName={restaurantName}
      expired={expired}
    />
  );
}
