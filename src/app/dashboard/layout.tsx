import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Control | Kitcho Menu',
  description: 'Gestiona tu menú digital interactivo, tasa BCV y habladores de mesa A5.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
