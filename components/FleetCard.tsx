'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Vehicle } from '@/lib/fleet';
import { formatUSD, formatCRC, crcToUsd, isSantaFeAvailable } from '@/lib/utils';
import VehicleImage from './VehicleImage';
import ReservationModal from './ReservationModal';

interface FleetCardProps {
  vehicle: Vehicle;
  index?: number;
  currency?: 'CRC' | 'USD';
  rate?: number | null;
}

export default function FleetCard({ vehicle, index = 0, currency = 'CRC', rate }: FleetCardProps) {
  const t = useTranslations('fleet');
  const [modalOpen, setModalOpen] = useState(false);

  const isLimited = vehicle.note === 'availability-limited' && !isSantaFeAvailable();

  const priceDisplay =
    currency === 'USD' && rate
      ? formatUSD(crcToUsd(vehicle.pricePerDayCRC, rate))
      : formatCRC(vehicle.pricePerDayCRC);

  return (
    <>
      {/* opacity-only animation — no Y movement to avoid scroll glitch in carousel */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: index * 0.07 }}
        className="group flex flex-col rounded-2xl overflow-hidden bg-white shadow-[0_2px_16px_rgba(27,67,50,0.07)] hover:shadow-[0_10px_36px_rgba(27,67,50,0.13)] transition-shadow duration-300"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-white flex-none">
          <VehicleImage image={vehicle.image} name={vehicle.name} />
          {/* Gradient pour depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/40 via-transparent to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                vehicle.category === 'economy'
                  ? 'bg-white text-forest'
                  : 'bg-forest text-white'
              }`}
            >
              {vehicle.category === 'economy' ? t('filterEconomy') : 'SUV'}
            </span>
            {vehicle.drive === '4x4' && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber text-forest-dark">
                4×4
              </span>
            )}
          </div>

          {/* Year — bottom right of image */}
          <span className="absolute bottom-3 right-3 z-10 text-[11px] font-medium text-white bg-forest-dark px-2 py-0.5 rounded-full">
            {vehicle.year}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="font-heading text-forest text-xl font-bold leading-tight">
            {vehicle.name}
          </h3>

          {/* Specs — text only, no icons */}
          <p className="mt-2 text-xs text-forest-muted">
            {vehicle.passengers} pax
            <span className="mx-1.5 text-sand-dark">·</span>
            {vehicle.drive}
            <span className="mx-1.5 text-sand-dark">·</span>
            {vehicle.luggage.large + vehicle.luggage.carryOn} {t('luggage')}
          </p>

          {/* Price */}
          <div className="mt-4 pt-4 border-t border-sand">
            {isLimited ? (
              <p className="text-forest font-semibold text-sm">{t('checkAvailability')}</p>
            ) : (
              <>
                <p className="font-heading text-forest text-2xl font-bold">
                  {priceDisplay}
                  <span className="text-sm font-normal text-forest-muted ml-1.5">{t('perDay')}</span>
                </p>
                <p className="text-xs text-forest-muted mt-0.5">{t('deposit')}: ${vehicle.deposit}</p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              disabled={isLimited}
              className={`flex-1 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 ${
                isLimited
                  ? 'bg-sand text-forest-muted cursor-not-allowed'
                  : 'bg-amber hover:bg-amber-dark text-forest-dark hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isLimited ? t('checkAvailability') : t('book')}
            </button>
            <Link
              href={`/vehicles/${vehicle.slug}` as any}
              className="px-4 py-2.5 rounded-xl bg-cream hover:bg-sand text-forest text-xs font-medium transition-all duration-200 flex items-center whitespace-nowrap"
            >
              {t('viewDetail')}
            </Link>
          </div>
        </div>
      </motion.div>

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
