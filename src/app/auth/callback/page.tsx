'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { createRestaurant } from '@/lib/actions';
import { SparkIcon } from '@/components/Icons';

// No prerender this page
export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace('/login');
          return;
        }

        // Check if restaurant exists
        const { data: existing, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', session.user.id)
          .single();

        if (restaurantError && restaurantError.code !== 'PGRST116') {
          throw restaurantError;
        }

        if (!existing) {
          // Create new restaurant with empty data
          await createRestaurant();
        }

        router.replace('/dashboard');
      } catch (callbackError) {
        setError(callbackError instanceof Error ? callbackError.message : 'No se pudo configurar tu cuenta.');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f7f4] px-5">
      <div className="card w-full max-w-sm p-8 text-center animate-scale-in">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--kitcho-orange)] text-white"><SparkIcon className="h-6 w-6" /></span>
        <p className="mt-5 font-bold text-[var(--kitcho-charcoal)]">{error || 'Configurando tu cuenta…'}</p>
      </div>
    </div>
  );
}
