'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatCRC } from '@/lib/utils';
import { minTransportPriceCRC } from '@/lib/transport';
import { ArrowRightIcon, PlaneIcon } from './icons';

export default function AirportTransferSection() {
  const t = useTranslations('airportSection');
  const points = (t.raw('points') as string[]).map((_, i) =>
    t(`points.${i}`, { price: formatCRC(minTransportPriceCRC()) }),
  );

  return (
    <section id="airport-transfer" className="bg-sand-light py-20 md:py-28 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Texto */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-amber-dark text-sm font-medium uppercase tracking-widest mb-3"
          >
            <PlaneIcon className="w-4 h-4" />
            {t('label')}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-forest text-4xl md:text-5xl font-bold leading-tight"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-forest-muted text-lg leading-relaxed max-w-xl"
          >
            {t('text')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 hidden lg:block"
          >
            <CtaLink label={t('cta')} />
          </motion.div>
        </div>

        {/* Puntos */}
        <div>
          <ol className="border-t border-forest/15">
            {points.map((point, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-baseline gap-5 sm:gap-6 py-5 sm:py-6 border-b border-forest/15"
              >
                <span className="flex-none font-heading text-amber-dark text-2xl sm:text-3xl leading-none tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-forest text-base sm:text-lg leading-snug">{point}</span>
              </motion.li>
            ))}
          </ol>
          <div className="mt-8 lg:hidden">
            <CtaLink label={t('cta')} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaLink({ label }: { label: string }) {
  return (
    <Link
      href="/transporte"
      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-forest hover:bg-forest-light text-white font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-forest/20"
    >
      {label}
      <ArrowRightIcon className="w-4 h-4" />
    </Link>
  );
}
