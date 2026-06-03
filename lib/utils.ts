export function getExchangeRate(): number {
  return Number(process.env.NEXT_PUBLIC_USD_CRC_RATE) || 530;
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
  return process.env.NEXT_PUBLIC_SANTAFE_AVAILABLE !== 'false';
}

export function getWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '50672816080';
}

export function buildWhatsAppUrl(message: string): string {
  const number = getWhatsAppNumber();
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
