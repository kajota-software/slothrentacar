// Datos del servicio de transporte al aeropuerto.
// Los nombres de lugar (from/to) quedan en español: así se envían por WhatsApp.
// Para mostrarlos en el sitio se traducen con `transport.places` en messages/*.json.

export type TransportRouteId =
  | 'airport-turrialba'
  | 'turrialba-airport'
  | 'turrialba-puertoviejo'
  | 'other';

export interface TransportRoute {
  id: TransportRouteId;
  from: string | null;
  to: string | null;
  priceCRC: number | null;
  oneWay?: boolean;
}

export const AIRPORT = 'Aeropuerto';

export const transportRoutes: TransportRoute[] = [
  { id: 'airport-turrialba',   from: AIRPORT,     to: 'Turrialba',    priceCRC: 60000 },
  { id: 'turrialba-airport',   from: 'Turrialba', to: AIRPORT,        priceCRC: 60000 },
  { id: 'turrialba-puertoviejo', from: 'Turrialba', to: 'Puerto Viejo', priceCRC: 100000, oneWay: true }, // solo ida (ir a dejar)
  { id: 'other',               from: null,        to: null,           priceCRC: null },   // otro destino: a cotizar
];

export const transportRules = {
  pricing: 'por viaje (no por persona)',
  sameRate24h: true,            // mismo precio las 24 horas, sin recargo nocturno
  maxPassengers: 4,
  maxLuggage: { large: 2, medium: 2 },
  flightDelayFeeUSD: 10,        // por cada hora de espera si el vuelo se atrasa
  minNoticeHours: 7,            // reserva con mínimo 7 horas de anticipación
  rentalAddonPriceCRC: 60000,   // traslado aeropuerto ↔ Turrialba cuando se renta un carro
};

// Mismo patrón bilingüe que `vehicleEditorial` en lib/fleet.ts.
// `short` es la versión corta en español que va en el mensaje de WhatsApp.
export const rentalRequirements: { es: string; en: string; short: string }[] = [
  { es: 'Edad mínima: 25 años', en: 'Minimum age: 25', short: '25+ años' },
  {
    es: 'Licencia de conducir vigente y válida en Costa Rica',
    en: "A current driver's license that's valid in Costa Rica",
    short: 'licencia válida en CR',
  },
  { es: 'Pasaporte o cédula', en: 'Passport or national ID', short: 'pasaporte/cédula' },
  {
    es: 'Tarjeta de crédito para el depósito de garantía',
    en: 'A credit card for the security deposit',
    short: 'tarjeta de crédito',
  },
];

export type RouteDirection = 'fromAirport' | 'toAirport' | 'other';

export function getTransportRoute(id: string): TransportRoute | undefined {
  return transportRoutes.find((r) => r.id === id);
}

export function routeDirection(route: TransportRoute | undefined): RouteDirection {
  if (route?.from === AIRPORT) return 'fromAirport';
  if (route?.to === AIRPORT) return 'toAirport';
  return 'other';
}

export function minTransportPriceCRC(): number {
  return Math.min(...transportRoutes.flatMap((r) => (r.priceCRC ? [r.priceCRC] : [])));
}
