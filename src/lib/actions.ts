'use server';

import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { EMPTY_MENU } from '@/lib/types';
import { calculateTrialEnd } from '@/lib/trial';

async function getAuthenticatedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase URL and ANON KEY must be set');
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return { supabase, user };
}

export async function createRestaurant() {
  const { supabase, user } = await getAuthenticatedClient();
  const { data: existingRestaurant, error: existingRestaurantError } = await supabase
    .from('restaurants')
    .select('id, owner_id, name, slug, logo_url, trial_starts_at, trial_ends_at, plan, created_at, updated_at')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (existingRestaurantError) {
    throw new Error(existingRestaurantError.message);
  }

  if (existingRestaurant) {
    return existingRestaurant;
  }

  const trialEnd = calculateTrialEnd();
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .insert({
      owner_id: user.id,
      trial_ends_at: trialEnd.toISOString(),
      plan: 'trial',
    })
    .select()
    .single();

  if (restaurantError) {
    throw new Error(restaurantError.message);
  }

  const { error: menuError } = await supabase
    .from('menus')
    .insert({
      restaurant_id: restaurant.id,
      data: EMPTY_MENU,
    });

  if (menuError) {
    throw new Error(menuError.message);
  }

  return restaurant;
}

export async function saveMenu(restaurantId: string, menuData: unknown) {
  const { supabase } = await getAuthenticatedClient();
  const { error } = await supabase
    .from('menus')
    .update({ data: menuData, updated_at: new Date().toISOString() })
    .eq('restaurant_id', restaurantId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function updateRestaurant(restaurantId: string, data: { name?: string; logo_url?: string }) {
  const { supabase } = await getAuthenticatedClient();
  const { error } = await supabase
    .from('restaurants')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', restaurantId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

// ─── Motor de Traducción de Alta Fiabilidad V2.0 ─────────────────────────────

const MYMEMORY_LANG_MAP: Record<string, string> = {
  en: 'en-US',
  ko: 'ko-KR',
  fr: 'fr-FR',
  it: 'it-IT',
  pt: 'pt-PT',
};

function normalizeCase(text: string): string {
  if (text === text.toUpperCase() && text.length > 2) {
    return text
      .toLowerCase()
      .replace(/(?:^|\.\s+|\?\s+|!\s+)(\p{L})/gu, (_, char: string) => char.toUpperCase());
  }
  return text;
}

/**
 * Traduce un único texto usando un sistema cascada de fallbacks de alta fiabilidad:
 * 1. Google Translate Engine (Ultra-rápido, sin cuota, precisión nativa)
 * 2. LibreTranslate Public API
 * 3. MyMemory API (normalizado)
 */
async function translateSingleTextFallback(text: string, targetLang: string): Promise<string | null> {
  // 1. Google Engine (Sin API Key, alta disponibilidad)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedParts = data[0].map((part: unknown[]) => part[0]).filter(Boolean);
        if (translatedParts.length > 0) {
          return translatedParts.join('');
        }
      }
    }
  } catch {
    // Continuar al siguiente fallback
  }

  // 2. LibreTranslate Public Engine
  try {
    const res = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'es',
        target: targetLang,
        format: 'text',
      }),
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.translatedText) {
        return data.translatedText;
      }
    }
  } catch {
    // Continuar al siguiente fallback
  }

  // 3. MyMemory Engine
  try {
    const langCode = MYMEMORY_LANG_MAP[targetLang] ?? targetLang;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es-ES|${langCode}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KitchoMenu/1.0' },
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.responseStatus === 200 && json.responseData?.translatedText) {
        return normalizeCase(json.responseData.translatedText as string);
      }
    }
  } catch {
    // Silencioso
  }

  return null;
}

export async function translateMenuBatch(texts: string[], targetLangs: string[]) {
  if (texts.length === 0 || targetLangs.length === 0) {
    return {};
  }

  const results: Record<string, Record<string, string>> = {};
  for (const text of texts) {
    results[text] = {};
  }

  // A) Si existe GOOGLE_TRANSLATE_API_KEY oficial en .env.local, usar la API oficial de Google Cloud v2 (Lote oficial)
  const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (googleApiKey && googleApiKey.trim() !== '') {
    for (const lang of targetLangs) {
      try {
        const response = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: texts,
              target: lang,
              source: 'es',
              format: 'text',
            }),
          }
        );

        if (response.ok) {
          const json = await response.json();
          const translations = json.data?.translations;
          if (Array.isArray(translations)) {
            for (let i = 0; i < texts.length; i++) {
              results[texts[i]][lang] = translations[i].translatedText;
            }
          }
        }
      } catch (err) {
        console.error(`Google API Key error para lang=${lang}:`, err);
      }
    }
    return results;
  }

  // B) Si no hay API Key oficial, usar el motor de cascada multi-proveedor con ejecucion por lotes (Chunked Concurrency)
  // Para evitar bloqueos por tasa de refresco, procesamos en fragmentos de 4 tareas concurrentes con 60ms de pausa entre fragmentos.
  const allTasks: { text: string; lang: string }[] = [];
  for (const text of texts) {
    for (const lang of targetLangs) {
      allTasks.push({ text, lang });
    }
  }

  const CHUNK_SIZE = 4;
  for (let i = 0; i < allTasks.length; i += CHUNK_SIZE) {
    const chunk = allTasks.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async ({ text, lang }) => {
        const translated = await translateSingleTextFallback(text, lang);
        if (translated) {
          results[text][lang] = translated;
        }
      })
    );

    if (i + CHUNK_SIZE < allTasks.length) {
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
  }

  return results;
}

// ─── Importador de Menú por IA Multimodal ─────────────────────────────────────

import { parseMenuWithAI } from '@/lib/ai-menu-parser';
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '@/lib/validations/import';

export async function parseMenuFileAction(payload: { base64: string; mimeType: string }) {
  try {
    const { user } = await getAuthenticatedClient();
    if (!user) {
      return { success: false, error: 'Debes estar autenticado para realizar esta acción.' };
    }

    const { base64, mimeType } = payload || {};
    if (!base64 || !mimeType) {
      return { success: false, error: 'No se ha adjuntado ningún archivo.' };
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return { success: false, error: 'Formato no soportado. Formatos admitidos: PDF, PNG, JPG y WebP.' };
    }

    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > MAX_FILE_SIZE) {
      return { success: false, error: 'El archivo supera el tamaño máximo permitido de 10 MB.' };
    }

    const extractedData = await parseMenuWithAI(buffer, mimeType);
    return { success: true, data: extractedData };
  } catch (err: unknown) {
    console.error('Error en parseMenuFileAction:', err);
    const message = err instanceof Error ? err.message : 'Error desconocido al analizar la carta.';
    return { success: false, error: message };
  }
}


