'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
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

  function scrollToFleet(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <section
        id="hero"
        className="grain-overlay relative min-h-screen flex items-center justify-center overflow-hidden bg-forest"
      >
        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 70% 30%, rgba(45,106,79,0.4) 0%, transparent 60%), linear-gradient(to bottom, rgba(15,42,31,0.3) 0%, rgba(15,42,31,0.7) 100%)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/4 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #D4A017, transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #2d6a4f, transparent)' }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
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
              className="block text-white/60"
              style={{ fontSize: '0.65em' }}
            >
              {t('headline3')}
            </motion.span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            custom={0.4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
          >
            {t('subtext')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={0.5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* Primary: scroll to fleet */}
            <a
              href="#fleet"
              onClick={scrollToFleet}
              className="group bg-amber hover:bg-amber-dark text-forest-dark font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-amber/20 w-full sm:w-auto text-center"
            >
              {t('cta')}
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">↓</span>
            </a>

            {/* Secondary: open reservation modal */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-2 border border-white/30 hover:border-amber hover:bg-white/10 text-white font-medium px-8 py-4 rounded-full text-base transition-all duration-200 w-full sm:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-400" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t('ctaBook')}
            </button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            custom={0.9}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-20 flex flex-col items-center gap-2 text-white/30"
          >
            <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/30" aria-hidden="true" />
            <span className="text-xs tracking-widest uppercase">Scroll</span>
          </motion.div>
        </div>
      </section>

      <ReservationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
