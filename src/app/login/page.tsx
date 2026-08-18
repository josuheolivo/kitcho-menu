'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import { ArrowUpRightIcon, CheckIcon } from '@/components/Icons';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lockoutSeconds > 0) return;

    setLoading(true);
    setError(null);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        setLockoutSeconds(60);
        setError('Demasiados intentos fallidos. Por razones de seguridad, espera 60 segundos antes de volver a intentarlo.');
        const interval = setInterval(() => {
          setLockoutSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setFailedAttempts(0);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (loginError.message.includes('Email not confirmed')) {
        setError('Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o spam.');
      } else if (loginError.message.includes('Invalid login credentials')) {
        setError(`Correo electrónico o contraseña incorrectos. (Intento ${nextAttempts}/5)`);
      } else {
        setError(loginError.message);
      }
      setLoading(false);
      return;
    }
    router.push('/dashboard');
  };

  return (
    <main className="grid min-h-screen bg-[#f7f7f4] lg:grid-cols-[.95fr_1.05fr]">
      <section className="relative hidden overflow-hidden bg-[var(--kitcho-charcoal)] px-12 py-12 text-white lg:flex lg:flex-col">
        <BrandMark className="!text-white [&_.brand-name]:!text-white" />
        <div className="my-auto max-w-md">
          <p className="eyebrow mb-5 !text-[#facc15]">Tu espacio de trabajo</p>
          <h1 className="display text-5xl">Vuelve a poner tu carta en el centro.</h1>
          <p className="mt-6 text-lg leading-8 text-white/65">Actualiza platos, precios e idiomas desde un único lugar.</p>
          <ul className="mt-10 space-y-4 text-sm text-white/80">
            {['Gestiona tu menú sin complicaciones', 'Publica cambios al instante', 'Mantén cada idioma organizado'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-[#facc15]">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/40">Kitcho Menu · para restaurantes que cuidan los detalles.</p>
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[var(--kitcho-orange)]/25 blur-3xl" />
      </section>

      <section className="flex min-h-screen items-center px-5 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-[27rem] animate-fade-in">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <BrandMark />
            <Link href="/" className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--kitcho-orange)]">
              Volver al inicio
            </Link>
          </div>
          <p className="eyebrow mb-4">Bienvenido de nuevo</p>
          <h2 className="display text-4xl text-[var(--kitcho-charcoal)]">Inicia sesión</h2>
          <p className="mt-3 text-[var(--text-secondary)]">Accede a tu panel para seguir dando forma a tu carta.</p>

          {error && (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="mt-8 space-y-5">
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
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input"
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" disabled={loading || lockoutSeconds > 0} className="btn btn-primary btn-lg w-full disabled:opacity-50">
              {lockoutSeconds > 0 ? `Esperar ${lockoutSeconds}s (Bloqueo de seguridad)` : loading ? 'Entrando…' : <>Entrar al panel <ArrowUpRightIcon /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            ¿Aún no tienes cuenta?{' '}
            <Link href="/register" className="font-bold text-[var(--kitcho-orange-dark)] hover:underline">
              Crea tu menú gratis
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
