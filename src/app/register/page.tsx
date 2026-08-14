'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import { ArrowUpRightIcon, CheckIcon } from '@/components/Icons';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push('/auth/callback');
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f4] px-5">
        <section className="card card-raised w-full max-w-md p-8 text-center animate-scale-in">
          <BrandMark className="justify-center" />
          <div className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-2xl bg-[#fff0e8] text-[var(--kitcho-orange)]">
            <CheckIcon className="h-7 w-7" />
          </div>
          <h1 className="display mt-6 text-4xl">Revisa tu correo</h1>
          <p className="mt-4 leading-7 text-[var(--text-secondary)]">
            Te hemos enviado un enlace de confirmación a <strong className="text-[var(--kitcho-charcoal)]">{email}</strong>.
            Ábrelo para activar tu cuenta e ingresar al panel.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg mt-8 w-full">
            Ir a iniciar sesión <ArrowUpRightIcon />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen bg-[#f7f7f4] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[var(--kitcho-orange)] px-12 py-12 text-white lg:flex lg:flex-col">
        <BrandMark className="!text-white [&_.brand-name]:!text-white [&_.brand-mark]:!bg-white [&_.brand-mark]:!text-[var(--kitcho-orange)] [&_.brand-mark]:!shadow-none" />
        <div className="my-auto max-w-md">
          <p className="eyebrow mb-5 !text-orange-100 before:!bg-orange-100">15 días para probarlo</p>
          <h1 className="display text-5xl">Tu menú digital empieza con una buena base.</h1>
          <p className="mt-6 text-lg leading-8 text-orange-50">Crea una carta tan clara y apetecible como tu propuesta.</p>
          <ul className="mt-10 space-y-4 text-sm text-orange-50">
            {['No necesitas tarjeta', 'Verificación por correo segura', 'Configúralo a tu ritmo'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-orange-100">Kitcho Menu · una carta que trabaja contigo.</p>
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-yellow-200/40 blur-3xl" />
      </section>

      <section className="flex min-h-screen items-center px-5 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-[27rem] animate-fade-in">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <BrandMark />
            <Link href="/" className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--kitcho-orange)]">
              Volver al inicio
            </Link>
          </div>
          <p className="eyebrow mb-4">Empieza sin compromiso</p>
          <h2 className="display text-4xl text-[var(--kitcho-charcoal)]">Crea tu cuenta</h2>
          <p className="mt-3 text-[var(--text-secondary)]">En unos minutos tendrás una carta lista para compartir.</p>

          {error && (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailRegister} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold text-[var(--kitcho-charcoal)]">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input"
                placeholder="tu@restaurante.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold text-[var(--kitcho-charcoal)]">
                Crea una contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? 'Creando tu cuenta…' : <>Crear mi menú <ArrowUpRightIcon /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-bold text-[var(--kitcho-orange-dark)] hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
