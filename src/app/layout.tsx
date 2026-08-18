import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kitcho-menu.vercel.app'),
  title: 'Kitcho Menu — Menú Digital para Restaurantes',
  description: 'Crea tu menú digital profesional en minutos. Múltiples cartas, 6 idiomas, alérgenos y tasa BCV.',
  alternates: {
    canonical: 'https://kitcho-menu.vercel.app',
  },
  openGraph: {
    title: 'Kitcho Menu — Menú Digital para Restaurantes',
    description: 'Crea tu menú digital profesional en minutos. Múltiples cartas, 6 idiomas, alérgenos y tasa BCV.',
    url: 'https://kitcho-menu.vercel.app',
    siteName: 'Kitcho Menu',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kitcho Menu — Menú Digital para Restaurantes',
    description: 'Crea tu menú digital profesional en minutos.',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
