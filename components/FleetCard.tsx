'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Vehicle } from '@/lib/fleet';
import { formatUSD, crcToUsd, isSantaFeAvailable } from '@/lib/utils';
import VehicleImage from './VehicleImage';
import ReservationModal from './ReservationModal';

interface FleetCardProps {
  vehicle: Vehicle;
  index?: number;
}

export default function FleetCard({ vehicle, index = 0 }: FleetCardProps) {
  const t = useTranslations('fleet');
  const [modalOpen, setModalOpen] = useState(false);

  const isLimited = vehicle.note === 'availability-limited' && !isSantaFeAvailable();
  const usdPrice = crcToUsd(vehicle.pricePerDayCRC);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-sand flex flex-col"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-sand">
          <VehicleImage slug={vehicle.slug} name={vehicle.name} />
          <div className="absolute top-3 left-3 z-20">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              vehicle.category === 'economy' ? 'bg-white/90 text-forest' : 'bg-forest/90 text-white'
            }`}>
              {vehicle.category === 'economy' ? t('filterEconomy') : 'SUV'}
            </span>
          </div>
          {vehicle.drive === '4x4' && (
            <div className="absolute top-3 right-3 z-20">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber text-forest-dark">4×4</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          {/* Name + year */}
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-heading text-forest text-lg font-bold">{vehicle.name}</h3>
            <span className="text-xs text-forest-muted font-medium">{vehicle.year}</span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 text-xs text-forest-muted mt-2 mb-4">
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-amber" aria-hidden="true">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
              </svg>
              {vehicle.passengers} {t('passengers')}
            </span>
            <span className="w-px h-3 bg-sand" aria-hidden="true" />
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-amber" aria-hidden="true">
                <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v1A1.5 1.5 0 0 1 12.5 6h-9A1.5 1.5 0 0 1 2 4.5v-1ZM2 9a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9Z" />
              </svg>
              {vehicle.luggage.large}+{vehicle.luggage.carryOn}
            </span>
            <span className="w-px h-3 bg-sand" aria-hidden="true" />
            <span>{vehicle.drive}</span>
          </div>

          {/* Price — USD only */}
          <div className="mt-auto">
            {isLimited ? (
              <div className="bg-sand rounded-2xl px-4 py-3 text-center">
                <p className="text-forest font-semibold text-sm">{t('checkAvailability')}</p>
              </div>
            ) : (
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-heading font-bold text-forest">
                    {formatUSD(usdPrice)}
                    <span className="text-sm font-normal text-forest-muted ml-1">{t('perDay')}</span>
                  </p>
                  <p className="text-xs text-forest-muted">{t('deposit')}: ${vehicle.deposit}</p>
                </div>
              </div>
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
              className="px-4 py-2.5 rounded-xl border border-sand hover:border-forest hover:text-forest text-forest-muted text-xs font-medium transition-all duration-200 flex items-center whitespace-nowrap"
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
      />
    </>
  );
}
