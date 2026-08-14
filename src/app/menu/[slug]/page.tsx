import { createPublicServerClient } from '@/lib/supabase';
import { MenuData, EMPTY_MENU } from '@/lib/types';
import { isTrialActive } from '@/lib/trial';
import MenuPublic from '@/components/MenuPublic';
import { SparkIcon } from '@/components/Icons';
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
    };
  }

  const name = restaurant.name || 'Restaurante';
  return {
    title: `${name} — Menú Digital`,
    description: `Consulta la carta y platos de ${name} online en Kitcho Menu.`,
    openGraph: {
      title: `${name} — Menú Digital`,
      description: `Consulta la carta y platos de ${name} online en Kitcho Menu.`,
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
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f7f4] px-5">
        <div className="text-center animate-fade-in max-w-md card p-8">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--kitcho-orange)] text-white">
            <SparkIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-[var(--kitcho-charcoal)]">Restaurante no encontrado</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
            No hemos podido encontrar ningún menú asociado a la dirección consultada. Por favor, comprueba el enlace o el código QR.
          </p>
        </div>
      </div>
    );
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
