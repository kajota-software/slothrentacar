/* ── Configuración del sitio (se cambia aquí, sin variables de entorno) ── */

/** Número de WhatsApp de Sloth (código de país + número, sin "+") */
export const WHATSAPP_NUMBER = '50671896080';

/** Tipo de cambio ₡/USD de respaldo — solo se usa si la API de Hacienda no responde */
export const USD_CRC_FALLBACK_RATE = 500;

/** Cambiar a false cuando el Santa Fe se venda: muestra "Consultar disponibilidad" */
export const SANTAFE_AVAILABLE = true;

export function getExchangeRate(): number {
  return USD_CRC_FALLBACK_RATE;
}

export function crcToUsd(crc: number, rate?: number): number {
  return crc / (rate ?? getExchangeRate());
}

export function usdToCrc(usd: number, rate?: number): number {
  return usd * (rate ?? getExchangeRate());
}

export function formatCRC(amount: number): string {
  return `₡${Math.round(amount).toLocaleString('es-CR')}`;
}

export function formatUSD(amount: number, decimals = 0): string {
  return `$${amount.toFixed(decimals)}`;
}

export function pricePerDayUSD(pricePerDayCRC: number, rate?: number): number {
  return crcToUsd(pricePerDayCRC, rate);
}

export function formatPricePerDay(pricePerDayCRC: number): string {
  return formatUSD(pricePerDayUSD(pricePerDayCRC));
}

export function isSantaFeAvailable(): boolean {
  return SANTAFE_AVAILABLE;
}

export function getWhatsAppNumber(): string {
  return WHATSAPP_NUMBER;
}

export function buildWhatsAppUrl(message: string): string {
  const number = getWhatsAppNumber();
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Copia del objeto sin las claves indicadas (útil para limpiar errores de formulario) */
export function omitKeys<T extends Record<string, unknown>>(obj: T, ...keys: string[]): T {
  const copy: Record<string, unknown> = { ...obj };
  for (const k of keys) delete copy[k];
  return copy as T;
}
