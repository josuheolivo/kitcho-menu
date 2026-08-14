import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kitcho Menu — Menú Digital para Restaurantes',
  description: 'Crea tu menú digital profesional en minutos. 15 días de prueba gratis. Sin tarjeta de crédito.',
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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
