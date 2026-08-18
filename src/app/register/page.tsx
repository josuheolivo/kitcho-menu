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

    // Validación de seguridad de contraseña (CWE-521)
    if (password.length < 10) {
      setError('La contraseña debe tener al menos 10 caracteres.');
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('La contraseña debe incluir al menos una letra mayúscula.');
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('La contraseña debe incluir al menos un número.');
      setLoading(false);
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('La contraseña debe incluir al menos un símbolo o carácter especial (ej. !@#$%^&*).');
      setLoading(false);
      return;
    }

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
      <section className="relative hidden overflow-hidden bg-[var(--kitcho-charcoal)] px-12 py-12 text-white lg:flex lg:flex-col">
        <BrandMark className="!text-white [&_.brand-name]:!text-white" />
        <div className="my-auto max-w-md">
          <p className="eyebrow mb-5 !text-[#facc15]">Empieza gratis hoy</p>
          <h1 className="display text-5xl">La carta que tu restaurante merece.</h1>
          <p className="mt-6 text-lg leading-8 text-white/65">Únete a Kitcho Menu y transforma la experiencia de tus comensales.</p>
          
          <div className="mt-10 space-y-4 text-slate-300">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 font-bold">
                ⚡
              </span>
              <p className="text-sm font-medium">
                <strong>Sincronización BCV en Vivo:</strong> Tus precios en Bolívares siempre al día automáticamente.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 font-bold">
                📸
              </span>
              <p className="text-sm font-medium">
                <strong>Carga Mágica por IA:</strong> Sube la foto de tu menú físico y digitalízalo en 30 segundos.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 font-bold">
                🖨️
              </span>
              <p className="text-sm font-medium">
                <strong>Habladores de Mesa A5 HD:</strong> Descarga tus carteles con código QR listos para imprimir.
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm text-white/40 mt-8">Kitcho Menu · Prueba de 15 días sin tarjeta de crédito.</p>
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[var(--kitcho-orange)]/25 blur-3xl pointer-events-none" />
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
                placeholder="Mín. 10 caract. (Mayúscula, número, símbolo)"
                autoComplete="new-password"
                minLength={10}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? 'Creando tu cuenta…' : <>Crear mi menú <ArrowUpRightIcon /></>}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="shrink-0 px-4 text-xs font-bold text-slate-400">O REGÍSTRATE CON</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
              }}
              className="btn btn-outline btn-lg w-full flex items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
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
