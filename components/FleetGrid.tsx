'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { fleet, type Vehicle } from '@/lib/fleet';
import { isSantaFeAvailable } from '@/lib/utils';
import FleetCard from './FleetCard';

type FilterKey = 'all' | 'economy' | 'suv' | '4x4' | '7pax';

const filters: { key: FilterKey; labelKey: string }[] = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'economy', labelKey: 'filterEconomy' },
  { key: 'suv', labelKey: 'filterSuv' },
  { key: '4x4', labelKey: 'filter4x4' },
  { key: '7pax', labelKey: 'filterPassengers' },
];

function applyFilter(vehicles: Vehicle[], filter: FilterKey): Vehicle[] {
  switch (filter) {
    case 'economy':
      return vehicles.filter((v) => v.category === 'economy');
    case 'suv':
      return vehicles.filter((v) => v.category === 'suv');
    case '4x4':
      return vehicles.filter((v) => v.drive === '4x4');
    case '7pax':
      return vehicles.filter((v) => v.passengers >= 7);
    default:
      return vehicles;
  }
}

export default function FleetGrid() {
  const t = useTranslations('fleet');
  const [active, setActive] = useState<FilterKey>('all');

  const visibleFleet = fleet.filter((v) => {
    if (v.note === 'availability-limited' && !isSantaFeAvailable()) return false;
    return true;
  });

  const filtered = applyFilter(visibleFleet, active);

  return (
    <section id="fleet" className="bg-cream py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-amber text-sm font-medium uppercase tracking-widest mb-3"
          >
            6 vehículos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-forest text-4xl md:text-5xl font-bold"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-forest-muted text-lg max-w-xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {filters.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active === key
                  ? 'bg-forest text-white shadow-md shadow-forest/20'
                  : 'bg-white text-forest-muted border border-sand hover:border-forest hover:text-forest'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </motion.div>

        {/* Grid — scroll on mobile, grid on desktop */}
        {filtered.length === 0 ? (
          <p className="text-center text-forest-muted py-12">No vehicles match this filter.</p>
        ) : (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="md:hidden flex gap-4 overflow-x-auto scroll-hide pb-4 -mx-4 px-4">
              {filtered.map((vehicle, i) => (
                <div key={vehicle.slug} className="flex-none w-72">
                  <FleetCard vehicle={vehicle} index={i} />
                </div>
              ))}
            </div>

            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((vehicle, i) => (
                <FleetCard key={vehicle.slug} vehicle={vehicle} index={i} />
              ))}
            </div>
          </>
        )}

        {/* Rate disclaimer */}
        <p className="mt-8 text-center text-xs text-forest-muted">
          * {t('rateRef')}
        </p>
      </div>
    </section>
  );
}
