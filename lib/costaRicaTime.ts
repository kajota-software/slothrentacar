// Fechas y horas siempre en hora de Costa Rica, sin importar la zona del dispositivo.
// Los inputs `datetime-local` devuelven "YYYY-MM-DDTHH:mm" y se interpretan como hora de CR.

export const CR_TIME_ZONE = 'America/Costa_Rica';

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function crParts(epoch: number) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CR_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(epoch));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return { y: get('year'), m: get('month'), d: get('day'), h: get('hour'), min: get('minute') };
}

/** "YYYY-MM-DDTHH:mm" (hora de CR) → epoch en ms */
export function crLocalToEpoch(value: string): number {
  const [date, time = '00:00'] = value.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const asUtc = Date.UTC(y, m - 1, d, h, min);
  // Diferencia entre la hora "de pared" en CR y UTC para ese instante
  const p = crParts(asUtc);
  const crAsUtc = Date.UTC(+p.y, +p.m - 1, +p.d, +p.h, +p.min);
  return asUtc - (crAsUtc - asUtc);
}

/** Epoch → "YYYY-MM-DDTHH:mm" en hora de CR (útil para el atributo `min`) */
export function epochToCrLocal(epoch: number): string {
  const p = crParts(epoch);
  return `${p.y}-${p.m}-${p.d}T${p.h}:${p.min}`;
}

/** Fecha y hora mínimas permitidas (ahora + N horas, hora de CR) */
export function crLocalNowPlusHours(hours: number): string {
  return epochToCrLocal(Date.now() + hours * 3_600_000);
}

export function meetsMinNotice(value: string, hours: number): boolean {
  if (!value) return false;
  return crLocalToEpoch(value) >= Date.now() + hours * 3_600_000;
}

/** "2026-10-27T14:30" → { date: "27 oct 2026", time: "2:30 p. m." } (siempre en español) */
export function formatCrLocalEs(value: string): { date: string; time: string } {
  if (!value) return { date: '—', time: '—' };
  const [date, time = ''] = value.split('T');
  const [y, m, d] = date.split('-');
  return {
    date: `${parseInt(d)} ${MONTHS_ES[parseInt(m) - 1]} ${y}`,
    time: formatTimeEs(time),
  };
}

/** "14:30" → "2:30 p. m." */
export function formatTimeEs(time: string): string {
  if (!time) return '—';
  const [hStr, min] = time.split(':');
  const h = parseInt(hStr);
  const suffix = h < 12 ? 'a. m.' : 'p. m.';
  return `${h % 12 === 0 ? 12 : h % 12}:${min} ${suffix}`;
}
