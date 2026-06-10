'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={i < rating ? '#D4A017' : '#e5e7eb'} className="w-4 h-4" aria-hidden="true">
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const t = useTranslations('testimonials');
  const reviews = t.raw('placeholder') as Array<{ name: string; origin: string; text: string; rating: number }>;
  const googleMapsUrl = t('googleMapsUrl');

  return (
    <section id="testimonials" className="bg-sand py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-sm hover:shadow-md transition-shadow"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-xs font-semibold text-gray-700">{t('googleReviews')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-gray-400" aria-hidden="true">
                <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06l5.25-5.25H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.25 5.22a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
              </svg>
            </a>
          </motion.div>

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

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-3xl p-7 shadow-sm border border-sand-dark/30"
            >
              <StarRating rating={review.rating} />
              <p className="mt-4 text-forest-dark text-sm leading-relaxed">&ldquo;{review.text}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center flex-none">
                  <span className="font-heading text-white font-bold text-sm">{review.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-forest">{review.name}</p>
                  <p className="text-xs text-forest-muted">{review.origin}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Link to Google Maps */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-forest-muted hover:text-forest text-sm font-medium transition-colors"
          >
            {t('viewOnGoogle')}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06l5.25-5.25H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.25 5.22a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
