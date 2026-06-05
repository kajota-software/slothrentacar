'use client';

import { useState, useEffect } from 'react';

export interface CurrencyRateState {
  rate: number | null;
  isValid: boolean;
  loading: boolean;
}

export function useCurrencyRate(): CurrencyRateState {
  const [state, setState] = useState<CurrencyRateState>({
    rate: null,
    isValid: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchRate() {
      try {
        const res = await fetch('https://api.hacienda.go.cr/indicadores/tc/dolar', {
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const valor: number = data?.compra?.valor;

        if (!valor || typeof valor !== 'number' || valor <= 0 || valor < 400) {
          if (!cancelled) setState({ rate: null, isValid: false, loading: false });
          return;
        }

        if (!cancelled) setState({ rate: valor, isValid: true, loading: false });
      } catch {
        if (!cancelled) setState({ rate: null, isValid: false, loading: false });
      }
    }

    fetchRate();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
