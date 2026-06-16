'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { fleet } from '@/lib/fleet';
import { isSantaFeAvailable } from '@/lib/utils';
import ReservationModal from './ReservationModal';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      delay,
    },
  }),
};

export default function Hero() {
  const t = useTranslations('hero');
  const [modalOpen, setModalOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [vehicleSlug, setVehicleSlug] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const minReturn = pickupDate
    ? new Date(new Date(pickupDate).getTime() + 86400000).toISOString().split('T')[0]
    : today;

  const availableVehicles = fleet.filter(
    (v) => !(v.note === 'availability-limited' && !isSantaFeAvailable())
  );

  function handleSearch() {
    setModalOpen(true);
  }

  const selectedVehicle = availableVehicles.find((v) => v.slug === vehicleSlug);

  return (
    <>
      <section
        id="hero"
        className="grain-overlay relative min-h-screen flex items-center justify-center overflow-hidden bg-forest"
      >
        {/* Background image */}
        <Image
          src="https://res.cloudinary.com/dv1klrgdi/image/upload/f_auto,q_auto/v1781592436/paisajeSloth_h4skdi.avif"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          aria-hidden="true"
        />

        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 70% 30%, rgba(45,106,79,0.5) 0%, transparent 60%), linear-gradient(to bottom, rgba(15,42,31,0.45) 0%, rgba(15,42,31,0.82) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          {/* Headline */}
          <motion.h1
            className="font-heading text-white leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}
          >
            <motion.span custom={0.1} variants={fadeUp} initial="hidden" animate="visible" className="block">
              {t('headline1')}
            </motion.span>
            <motion.span custom={0.2} variants={fadeUp} initial="hidden" animate="visible" className="block text-amber">
              {t('headline2')}
            </motion.span>
            <motion.span
              custom={0.3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="block text-white/80"
              style={{ fontSize: '0.65em' }}
            >
              {t('headline3')}
            </motion.span>
          </motion.h1>

          {/* Adventure subtext */}
          <motion.p
            custom={0.4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 text-white/75 text-lg md:text-xl leading-relaxed max-w-lg mx-auto"
          >
            {t('subtext')}
          </motion.p>

          {/* No hidden fees badge */}
          <motion.div
            custom={0.45}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 text-amber">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-xl md:text-2xl tracking-tight">{t('noHiddenFees')}</span>
            </div>
          </motion.div>

          {/* Search form */}
          <motion.div
            custom={0.5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8"
          >
            {/* Card: solo inputs, sin botón */}
            <div
              className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.25)]"
              style={{ background: 'rgba(15,42,31,0.72)', backdropFilter: 'blur(20px)' }}
            >
              {/* Row 1: Fecha inicio + Fecha fin */}
              <div className="grid grid-cols-2 divide-x divide-white/10">
                <div className="px-5 py-4">
                  <label htmlFor="hero-date-start" className="block text-amber text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                    {t('dateStart')}
                  </label>
                  <input
                    id="hero-date-start"
                    type="date"
                    min={today}
                    value={pickupDate}
                    onChange={(e) => {
                      setPickupDate(e.target.value);
                      if (returnDate && returnDate <= e.target.value) setReturnDate('');
                    }}
                    className="w-full bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
                  />
                </div>
                <div className="px-5 py-4">
                  <label htmlFor="hero-date-end" className="block text-amber text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                    {t('dateEnd')}
                  </label>
                  <input
                    id="hero-date-end"
                    type="date"
                    min={minReturn}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Row 2: Vehículo — ancho completo */}
              <div className="px-5 py-4 border-t border-white/10">
                <label htmlFor="hero-vehicle" className="block text-amber text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                  {t('vehicleLabel')}
                </label>
                <select
                  id="hero-vehicle"
                  value={vehicleSlug}
                  onChange={(e) => setVehicleSlug(e.target.value)}
                  className="w-full bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
                >
                  <option value="" className="text-forest bg-forest-dark">{t('vehicleAny')}</option>
                  {availableVehicles.map((v) => (
                    <option key={v.slug} value={v.slug} className="text-white bg-forest-dark">
                      {v.name} {v.year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTA fuera del card */}
            <button
              onClick={handleSearch}
              className="mt-4 w-full bg-amber hover:bg-amber-dark text-forest-dark font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 hover:scale-[1.01] active:scale-95 shadow-lg shadow-amber/20"
            >
              {t('searchCta')}
            </button>
          </motion.div>

          {/* Secondary CTA */}
          <motion.div
            custom={0.65}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6"
          >
            <a
              href="#fleet"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-white/75 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-1"
            >
              {t('cta')} ↓
            </a>
          </motion.div>
        </div>
      </section>

      <ReservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedVehicle={selectedVehicle}
        preselectedPickupDate={pickupDate}
        preselectedReturnDate={returnDate}
      />
    </>
  );
}
