import { createClient } from '@supabase/supabase-js';

export interface BcvRateResult {
  rateVes: number;
  source: string;
  fetchedAt: string;
  isFallback?: boolean;
}

// Tasa de reserva estática por si falla cualquier conexión y no hay datos previos
const FALLBACK_DEFAULT_RATE = 40.0;

/**
 * Obtiene la última tasa BCV desde Supabase o consulta las APIs públicas con caché.
 */
export async function getLatestBcvRate(): Promise<BcvRateResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        .from('bcv_rates')
        .select('rate_ves, source, fetched_at')
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data && data.rate_ves > 0) {
        return {
          rateVes: Number(data.rate_ves),
          source: data.source || 'BCV_DATABASE_CACHE',
          fetchedAt: data.fetched_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Advertencia al consultar tasa BCV en Supabase:', err);
    }
  }

  // Si no hay datos en la BD o aún no se ha ejecutado el cron, intentamos consulta en directo
  return await syncAndFetchFreshBcvRate();
}

/**
 * Sincroniza la tasa BCV desde fuentes oficiales o espejos confiables y la guarda en la base de datos.
 */
export async function syncAndFetchFreshBcvRate(): Promise<BcvRateResult> {
  let rateVes: number | null = null;
  let sourceUsed = 'BCV_DIRECT';

  // 1. Intentar desde DolarApi VE (Espejo respaldado por BCV)
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      const val = parseFloat(json.promedio);
      if (!isNaN(val) && val > 0) {
        rateVes = val;
        sourceUsed = 'DOLARAPI_BCV';
      }
    }
  } catch (e) {
    console.warn('Fallback: DolarApi VE no respondió:', e);
  }

  // 2. Intentar desde PyDolarVenezuela (Espejo secundario)
  if (!rateVes) {
    try {
      const res = await fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar/page?page=bcv', {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const bcvObj = json?.monedas?.usd || json?.moneda;
        if (bcvObj && bcvObj.promedio) {
          const val = parseFloat(bcvObj.promedio);
          if (!isNaN(val) && val > 0) {
            rateVes = val;
            sourceUsed = 'PYDOLAR_BCV';
          }
        }
      }
    } catch (e) {
      console.warn('Fallback: PyDolarVenezuela no respondió:', e);
    }
  }

  // 3. Fallback directo: Scraping ligero del portal del BCV
  if (!rateVes) {
    try {
      const res = await fetch('https://www.bcv.org.ve', {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (res.ok) {
        const html = await res.text();
        const match = html.match(/id="dolar"[\s\S]*?<strong>\s*([\d,.]+)\s*<\/strong>/i);
        if (match && match[1]) {
          const cleanStr = match[1].replace(/\./g, '').replace(',', '.');
          const val = parseFloat(cleanStr);
          if (!isNaN(val) && val > 0) {
            rateVes = val;
            sourceUsed = 'BCV_HTML_SCRAPING';
          }
        }
      }
    } catch (e) {
      console.warn('Fallback: Portal BCV oficial no respondió:', e);
    }
  }

  const finalRate = rateVes || FALLBACK_DEFAULT_RATE;
  const isFallback = !rateVes;
  const now = new Date().toISOString();

  // Guardar en Supabase si la clave Service Role o Anon Key está disponible
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && rateVes) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('bcv_rates').insert({
        rate_ves: finalRate,
        source: sourceUsed,
        fetched_at: now,
      });
    } catch (err) {
      console.warn('No se pudo guardar la tasa BCV en Supabase:', err);
    }
  }

  return {
    rateVes: finalRate,
    source: sourceUsed,
    fetchedAt: now,
    isFallback,
  };
}
