'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { rentalRequirements } from '@/lib/transport';

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
  idPrefix,
}: {
  question: string;
  answer: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  idPrefix: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="border-b border-sand-dark last:border-0"
    >
      <button
        id={`${idPrefix}-trigger-${index}`}
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={isOpen}
        aria-controls={`${idPrefix}-panel-${index}`}
      >
        <span className="font-heading text-forest font-semibold text-base md:text-lg group-hover:text-forest-light transition-colors">
          {question}
        </span>
        <span
          className={`flex-none w-8 h-8 rounded-full border-2 border-forest/20 flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'bg-forest border-forest rotate-45' : 'group-hover:border-forest'
          }`}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill={isOpen ? 'white' : '#1B4332'}
            className="w-4 h-4"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            id={`${idPrefix}-panel-${index}`}
            role="region"
            aria-labelledby={`${idPrefix}-trigger-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-forest-muted leading-relaxed text-sm md:text-base">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* Respuesta de requisitos: se arma desde rentalRequirements para no tener dos versiones */
function RequirementsAnswer({ intro }: { intro: string }) {
  const locale = useLocale() === 'en' ? 'en' : 'es';
  return (
    <>
      <p>{intro}</p>
      <ul className="mt-2 space-y-1 list-disc pl-5">
        {rentalRequirements.map((r) => (
          <li key={r.es}>{r[locale]}</li>
        ))}
      </ul>
    </>
  );
}

interface FAQProps {
  /** Namespace de traducción con label, title, subtitle e items */
  namespace?: 'faq' | 'transport.faq';
  id?: string;
}

export default function FAQ({ namespace = 'faq', id = 'faq' }: FAQProps) {
  const t = useTranslations(namespace);
  const items = t.raw('items') as Array<{ q: string; a: string; key?: string }>;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id={id} className="bg-cream py-24 md:py-32 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
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
            className="mt-4 text-forest-muted text-lg"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Accordion */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-sand">
          {items.map((item, i) => (
            <AccordionItem
              key={i}
              index={i}
              idPrefix={id}
              question={item.q}
              answer={item.key === 'requirements' ? <RequirementsAnswer intro={item.a} /> : <p>{item.a}</p>}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
