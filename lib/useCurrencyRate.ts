'use client';

import { useState, useEffect } from 'react';

export interface CurrencyRateState {
  rate: number | null;
  isValid: boolean;
  loading: boolean;
}

// Una sola consulta compartida por toda la página: todos los componentes (flota, modales,
// transporte) usan exactamente la misma tasa de Hacienda. Si falla, se reintenta en el próximo montaje.
let ratePromise: Promise<number | null> | null = null;

function fetchHaciendaRate(): Promise<number | null> {
  ratePromise ??= (async () => {
    try {
      // Proxy propio (app/api/exchange-rate) — mismo origen, cacheado en el servidor
      const res = await fetch('/api/exchange-rate', {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const valor: unknown = data?.rate;
      if (typeof valor !== 'number' || valor < 400) throw new Error('Invalid rate');
      return valor;
    } catch {
      ratePromise = null;
      return null;
    }
  })();
  return ratePromise;
}

export function useCurrencyRate(): CurrencyRateState {
  const [state, setState] = useState<CurrencyRateState>({
    rate: null,
    isValid: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    fetchHaciendaRate().then((rate) => {
      if (!cancelled) setState({ rate, isValid: rate !== null, loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
