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
    .select('name, logo_url, country_code')
    .eq('slug', slug)
    .single();

  if (!restaurant) {
    return {
      title: 'Menú no encontrado — Kitcho Menu',
      robots: { index: false, follow: false },
    };
  }

  const name = restaurant.name || 'Restaurante';
  const ogImageUrl = restaurant.logo_url && restaurant.logo_url.startsWith('http')
    ? restaurant.logo_url
    : 'https://kitcho-menu.vercel.app/icon.svg';

  return {
    title: `${name} — Menú Digital`,
    description: `Descubre la carta, especialidades, alérgenos y precios actualizados de ${name} online en Kitcho Menu.`,
    alternates: {
      canonical: `https://kitcho-menu.vercel.app/menu/${slug}`,
    },
    openGraph: {
      title: `${name} — Menú Digital`,
      description: `Descubre la carta, especialidades y precios de ${name} online en Kitcho Menu.`,
      url: `https://kitcho-menu.vercel.app/menu/${slug}`,
      siteName: name,
      locale: 'es_ES',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Carta digital de ${name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — Menú Digital`,
      description: `Descubre la carta y precios de ${name} online.`,
      images: [ogImageUrl],
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

  // Schema.org JSON-LD para Restaurant + Menu
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    'name': restaurantName,
    'image': restaurant.logo_url || 'https://kitcho-menu.vercel.app/icon.svg',
    'url': `https://kitcho-menu.vercel.app/menu/${slug}`,
    'hasMenu': {
      '@type': 'Menu',
      'name': 'Carta Principal',
      'hasMenuSection': (menu.menus || []).map((collection) => ({
        '@type': 'MenuSection',
        'name': collection.name.es || collection.name.en || 'Sección',
        'hasMenuItem': (collection.categories || []).flatMap((category) =>
          (category.items || []).map((item) => ({
            '@type': 'MenuItem',
            'name': item.name.es || item.name.en || '',
            'description': item.description.es || item.description.en || '',
            'image': item.imageUrl || undefined,
            'offers': {
              '@type': 'Offer',
              'price': item.price ? item.price.replace(',', '.') : '0.00',
              'priceCurrency': restaurant.country_code === 'VE' ? 'USD' : 'EUR',
            },
          }))
        ),
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MenuPublic
        menu={menu}
        restaurantName={restaurantName}
        logoUrl={restaurant.logo_url}
        expired={expired}
      />
    </>
  );
}
