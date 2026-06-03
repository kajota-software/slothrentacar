'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import ReservationModal from './ReservationModal';

const destinationGradients = [
  'from-forest-dark via-forest to-forest-light',
  'from-[#1a3a2a] via-[#2d5a3d] to-[#1b4332]',
  'from-[#0f2a1f] via-[#1b4332] to-[#2d6a4f]',
  'from-[#1a3550] via-[#1e4d7b] to-[#155e8a]',
  'from-[#1a2a1a] via-[#264d26] to-[#1b4332]',
  'from-[#3a2000] via-[#5c3600] to-[#7a4800]',
];

export default function Destinations() {
  const t = useTranslations('destinations');
  const [modalOpen, setModalOpen] = useState(false);
  const items = t.raw('items') as Array<{ name: string; desc: string; tag: string }>;

  return (
    <>
      <section id="destinations" className="bg-cream py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-amber text-sm font-medium uppercase tracking-widest mb-3"
            >
              Costa Rica
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

          {/* Cards — 3 cols, 2 rows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="group relative rounded-3xl overflow-hidden cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                {/* Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${destinationGradients[i] ?? destinationGradients[0]} transition-all duration-500 group-hover:scale-105`} />

                {/* Dot pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='4' cy='4' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                  aria-hidden="true"
                />

                {/* Content */}
                <div className="relative z-10 p-7 min-h-[260px] flex flex-col justify-end">
                  <span className="absolute top-5 right-5 font-heading text-white/10 text-6xl font-bold leading-none" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="inline-block bg-amber/20 border border-amber/30 text-amber text-xs font-medium px-3 py-1 rounded-full mb-3 w-fit">
                    {item.tag}
                  </span>
                  <h3 className="font-heading text-white text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{item.desc}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-amber text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {t('cta')}
                    <span aria-hidden="true">→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ReservationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
