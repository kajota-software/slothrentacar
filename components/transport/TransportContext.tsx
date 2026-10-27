'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useCurrencyRate } from '@/lib/useCurrencyRate';
import { getExchangeRate } from '@/lib/utils';
import type { TransportRoute } from '@/lib/transport';

interface TransportContextValue {
  routeId: string;
  setRouteId: (id: string) => void;
  /** Selecciona la ruta y baja al formulario */
  selectRoute: (id: string) => void;
  /** Tipo de cambio (Hacienda en vivo o el de referencia) */
  rate: number;
}

const TransportContext = createContext<TransportContextValue | null>(null);

export function TransportProvider({ children }: { children: ReactNode }) {
  const [routeId, setRouteId] = useState('');
  const { rate: liveRate } = useCurrencyRate();
  const rate = liveRate ?? getExchangeRate();

  function selectRoute(id: string) {
    setRouteId(id);
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <TransportContext.Provider value={{ routeId, setRouteId, selectRoute, rate }}>
      {children}
    </TransportContext.Provider>
  );
}

export function useTransport(): TransportContextValue {
  const ctx = useContext(TransportContext);
  if (!ctx) throw new Error('useTransport must be used inside <TransportProvider>');
  return ctx;
}

/** Nombre de lugar traducido para mostrar en el sitio */
export function usePlaceName() {
  const t = useTranslations('transport');
  const places = t.raw('places') as Record<string, string>;
  return (name: string | null) => (name ? places[name] ?? name : '');
}

export function useRouteLabel() {
  const place = usePlaceName();
  return (route: TransportRoute) => `${place(route.from)} → ${place(route.to)}`;
}
