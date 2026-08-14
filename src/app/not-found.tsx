import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import { ArrowUpRightIcon, SparkIcon } from '@/components/Icons';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f7f4] px-5 py-12">
      <div className="card card-raised w-full max-w-md p-8 text-center animate-scale-in">
        <BrandMark className="justify-center" />

        <div className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-2xl bg-[#fff0e8] text-[var(--kitcho-orange)] shadow-sm">
          <SparkIcon className="h-8 w-8" />
        </div>

        <h1 className="display mt-6 text-4xl text-[var(--kitcho-charcoal)]">
          Menú no encontrado
        </h1>

        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
          No hemos podido encontrar la carta o página consultada. Por favor, comprueba el enlace o escanea de nuevo el código QR.
        </p>

        <div className="mt-8 pt-6 border-t border-[var(--border)] space-y-3">
          <Link href="/" className="btn btn-primary btn-lg w-full">
            Ir a la página principal <ArrowUpRightIcon />
          </Link>
          <p className="text-xs text-[var(--text-secondary)] pt-2">
            ¿Eres hostelero y buscas una carta digital para tu local?{' '}
            <Link href="/register" className="font-bold text-[var(--kitcho-orange-dark)] hover:underline">
              Crea tu menú gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
