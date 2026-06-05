'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Vehicle } from '@/lib/fleet';
import { formatCRC, formatUSD, crcToUsd } from '@/lib/utils';
import { useCurrencyRate } from '@/lib/useCurrencyRate';
import ReservationModal from './ReservationModal';

interface Props {
  vehicle: Vehicle;
  isLimited: boolean;
}

export default function VehicleBooking({ vehicle, isLimited }: Props) {
  const t = useTranslations('vehicle');
  const [modalOpen, setModalOpen] = useState(false);
  const [currency, setCurrency] = useState<'CRC' | 'USD'>('CRC');
  const { rate, isValid } = useCurrencyRate();

  const priceDisplay =
    currency === 'USD' && isValid && rate
      ? `${formatUSD(crcToUsd(vehicle.pricePerDayCRC, rate))} USD`
      : formatCRC(vehicle.pricePerDayCRC);

  const currencyLabel = currency === 'USD' ? 'USD' : 'CRC';

  return (
    <>
      <div className="mt-8 bg-white rounded-3xl p-6 border border-sand text-center">
        {isLimited ? (
          <p className="font-heading text-forest text-lg font-semibold">
            {t('availabilityLimited')}
          </p>
        ) : (
          <>
            {/* Currency toggle — centrado */}
            {isValid && rate && (
              <div className="flex justify-center mb-5">
                <div className="inline-flex items-center bg-cream border border-sand rounded-full p-1">
                  <button
                    onClick={() => setCurrency('CRC')}
                    className={`px-4 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      currency === 'CRC'
                        ? 'bg-forest text-white shadow-sm'
                        : 'text-forest-muted hover:text-forest'
                    }`}
                  >
                    ₡ Colones
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-4 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      currency === 'USD'
                        ? 'bg-forest text-white shadow-sm'
                        : 'text-forest-muted hover:text-forest'
                    }`}
                  >
                    $ Dólares
                  </button>
                </div>
              </div>
            )}

            {/* Precio — centrado */}
            <p className="text-xs text-forest-muted uppercase tracking-wide mb-1">{t('pricePerDay')}</p>
            <p className="font-heading text-forest text-5xl font-bold leading-none">
              {priceDisplay}
            </p>
            <p className="text-sm text-forest-muted mt-1">{currencyLabel}</p>
          </>
        )}
      </div>

      {/* Único botón de reserva — amber, ancho completo */}
      {!isLimited && (
        <button
          onClick={() => setModalOpen(true)}
          className="mt-4 w-full bg-amber hover:bg-amber-dark text-forest-dark font-semibold py-4 rounded-2xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md shadow-amber/20"
        >
          {t('bookNow')}
        </button>
      )}

      <ReservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedVehicle={vehicle}
        currency={currency}
        rate={rate}
      />
    </>
  );
}
