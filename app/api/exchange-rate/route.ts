// Proxy del tipo de cambio de Hacienda: se consulta desde el servidor (sin CSP ni CORS
// del navegador de por medio) y se cachea 1 h en el Data Cache y en el CDN.
const HACIENDA_URL = 'https://api.hacienda.go.cr/indicadores/tc/dolar';

export async function GET() {
  try {
    const res = await fetch(HACIENDA_URL, {
      headers: { Accept: 'application/json', 'User-Agent': 'slothrentacar.com' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const valor: unknown = data?.compra?.valor;

    if (typeof valor !== 'number' || valor < 400) throw new Error('Invalid rate');

    return Response.json(
      { rate: valor, date: data?.compra?.fecha ?? null },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    );
  } catch {
    return Response.json(
      { rate: null },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
