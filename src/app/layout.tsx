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
  title: 'Kitcho Menu | Menú Digital QR con IA y Tasa BCV para Restaurantes',
  description: 'Crea el menú QR interactivo de tu restaurante en 30 segundos con IA. Sincronización automática de Tasa BCV, doble moneda ($/Bs) y habladores de mesa A5. Prueba 15 días gratis.',
  keywords: [
    "menú digital venezuela",
    "carta qr restaurantes caracas",
    "menú qr tasa bcv",
    "software para restaurantes venezuela",
    "habladores de mesa qr a5",
    "carta digital doble moneda",
    "menú interactivo valencia lecheria"
  ],
  alternates: {
    canonical: 'https://kitcho-menu.vercel.app',
  },
  openGraph: {
    title: 'Kitcho Menu · La carta digital interactiva que vende por ti',
    description: 'Sube la foto de tu menú físico y la IA lo digitaliza en 30 segundos con tasa BCV automática.',
    url: 'https://kitcho-menu.vercel.app',
    siteName: 'Kitcho Menu',
    locale: 'es_VE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kitcho Menu | Menú Digital QR con Tasa BCV',
    description: 'Digitaliza tu carta con IA en 30s. Sincronización automática de tasa BCV en Venezuela.',
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
