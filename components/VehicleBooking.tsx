'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Vehicle } from '@/lib/fleet';
import ReservationModal from './ReservationModal';

interface Props {
  vehicle: Vehicle;
  pricePerDayUSD: string;
  isLimited: boolean;
}

export default function VehicleBooking({ vehicle, pricePerDayUSD, isLimited }: Props) {
  const t = useTranslations('vehicle');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="mt-8 bg-white rounded-3xl p-5 border border-sand">
        {isLimited ? (
          <div className="text-center">
            <p className="font-heading text-forest text-lg font-semibold">{t('availabilityLimited')}</p>
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-forest-muted">{t('pricePerDay')}</p>
              <p className="font-heading text-forest text-4xl font-bold">{pricePerDayUSD}</p>
              <p className="text-xs text-forest-muted mt-0.5">USD</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-amber hover:bg-amber-dark text-forest-dark font-semibold px-7 py-3.5 rounded-2xl text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-md shadow-amber/20"
            >
              {t('bookNow')}
            </button>
          </div>
        )}
      </div>

      {/* Extras card inline book button */}
      {!isLimited && (
        <button
          id="vehicle-book-inline"
          onClick={() => setModalOpen(true)}
          className="mt-6 w-full bg-white hover:bg-cream text-forest font-semibold py-3 rounded-2xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-sand"
        >
          {t('bookNow')}
        </button>
      )}

      <ReservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedVehicle={vehicle}
      />
    </>
  );
}
