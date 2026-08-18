import { notFound } from 'next/navigation';
import { createPublicServerClient } from '@/lib/supabase';
import { MenuData, EMPTY_MENU } from '@/lib/types';
import { isTrialActive } from '@/lib/trial';
import MenuPublic from '@/components/MenuPublic';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabaseClient = await createPublicServerClient();

  const { data: restaurant } = await supabaseClient
    .from('restaurants')
    .select('name, logo_url')
    .eq('slug', slug)
    .single();

  if (!restaurant) {
    return {
      title: 'Menú no encontrado — Kitcho Menu',
      robots: { index: false, follow: false },
    };
  }

  const name = restaurant.name || 'Restaurante';
  return {
    title: `${name} — Menú Digital`,
    description: `Consulta la carta y platos de ${name} online en Kitcho Menu.`,
    alternates: {
      canonical: `https://kitcho-menu.vercel.app/menu/${slug}`,
    },
    openGraph: {
      title: `${name} — Menú Digital`,
      description: `Consulta la carta y platos de ${name} online en Kitcho Menu.`,
      url: `https://kitcho-menu.vercel.app/menu/${slug}`,
      images: restaurant.logo_url ? [{ url: restaurant.logo_url }] : [],
    },
  };
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;
  const supabaseClient = await createPublicServerClient();

  const { data: restaurant } = await supabaseClient
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!restaurant) {
    notFound();
  }

  const restaurantName = restaurant.name || 'Restaurante';
  const expired = !isTrialActive(restaurant.trial_ends_at);

  const { data: menuData } = await supabaseClient
    .from('menus')
    .select('data')
    .eq('restaurant_id', restaurant.id)
    .single();

  const menu = menuData?.data ? (menuData.data as MenuData) : EMPTY_MENU;

  return (
    <MenuPublic
      menu={menu}
      restaurantName={restaurantName}
      logoUrl={restaurant.logo_url}
      expired={expired}
    />
  );
}
