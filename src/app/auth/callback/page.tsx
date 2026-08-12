'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { createRestaurant } from '@/lib/actions';

// No prerender this page
export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if restaurant exists
        const { data: existing } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', session.user.id)
          .single();

        if (!existing) {
          // Create new restaurant with empty data
          await createRestaurant(session.user.id);
        }

        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--kitcho-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Configurando tu cuenta...</p>
      </div>
    </div>
  );
}
