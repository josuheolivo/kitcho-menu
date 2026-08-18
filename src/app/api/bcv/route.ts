import { NextResponse } from 'next/server';
import { getLatestBcvRate, syncAndFetchFreshBcvRate } from '@/lib/bcv';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const result = forceRefresh
      ? await syncAndFetchFreshBcvRate()
      : await getLatestBcvRate();

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener la tasa BCV', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verificar seguridad del endpoint si hay un secreto configurado
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const result = await syncAndFetchFreshBcvRate();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al sincronizar la tasa BCV', details: (error as Error).message },
      { status: 500 }
    );
  }
}
