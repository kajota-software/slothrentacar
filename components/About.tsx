'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations('about');
  const originParagraphs = t.raw('originParagraphs') as string[];
  const slothParagraphs = t.raw('slothParagraphs') as string[];

  return (
    <section id="about" className="bg-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-amber text-sm font-medium uppercase tracking-widest mb-3"
          >
            {t('label')}
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

        {/* Two cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Origen */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-cream rounded-3xl p-8 md:p-10"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-forest-dark" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h3 className="font-heading text-forest text-2xl font-bold mb-5">
              {t('originTitle')}
            </h3>
            <div className="space-y-4">
              {originParagraphs.map((p, i) => (
                <p key={i} className="text-forest-muted leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Card 2: Por qué Sloth */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-forest rounded-3xl p-8 md:p-10"
          >
            <div className="text-3xl mb-6" aria-hidden="true">🦥</div>
            <h3 className="font-heading text-white text-2xl font-bold mb-5">
              {t('slothTitle')}
            </h3>
            <div className="space-y-4">
              {slothParagraphs.map((p, i) => (
                <p key={i} className="text-white/70 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
