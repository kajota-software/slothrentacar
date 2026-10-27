'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { transportRoutes, AIRPORT } from '@/lib/transport';
import { crcToUsd, formatCRC, formatUSD, cn } from '@/lib/utils';
import InfoTip from '../InfoTip';
import { ArrowRightIcon, MapPinIcon, PlaneIcon } from '../icons';
import { usePlaceName, useTransport } from './TransportContext';

export default function TransportRoutes() {
  const t = useTranslations('transport.routes');
  const tTips = useTranslations('infoTips');
  const { selectRoute, rate } = useTransport();
  const place = usePlaceName();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {transportRoutes.map((route, i) => {
        const isOther = route.priceCRC === null;
        return (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className={cn(
              'flex flex-col rounded-3xl p-6',
              isOther
                ? 'border-2 border-dashed border-forest/30 bg-sand-light'
                : 'bg-white border border-sand shadow-[0_2px_16px_rgba(27,67,50,0.07)]',
            )}
          >
            {isOther ? (
              <>
                <span className="w-11 h-11 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5" />
                </span>
                <h3 className="mt-4 font-heading text-forest text-lg font-bold leading-snug flex items-center gap-2">
                  {t('otherTitle')}
                  <InfoTip text={tTips('otherDestination')} />
                </h3>
                <p className="mt-2 text-forest-muted text-sm leading-relaxed">{t('otherDesc')}</p>
                <p className="mt-auto pt-5 font-heading text-forest text-2xl font-bold">{t('otherPrice')}</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="w-11 h-11 rounded-xl bg-forest text-amber flex items-center justify-center">
                    {route.from === AIRPORT ? <PlaneIcon className="w-5 h-5" /> : <MapPinIcon className="w-5 h-5" />}
                  </span>
                  {route.oneWay && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber/15 text-amber-dark">
                      {t('oneWay')}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-heading text-forest text-lg font-bold leading-snug flex flex-wrap items-center gap-x-2">
                  <span>{place(route.from)}</span>
                  <ArrowRightIcon className="w-4 h-4 text-amber-dark" />
                  <span>{place(route.to)}</span>
                </h3>
                <div className="mt-auto pt-5">
                  <p className="font-heading text-forest text-3xl font-bold leading-none">
                    {formatCRC(route.priceCRC ?? 0)}
                  </p>
                  <p className="mt-1.5 text-forest-muted text-sm">
                    {t('perTrip')} · ~{formatUSD(crcToUsd(route.priceCRC ?? 0, rate))} USD
                  </p>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => selectRoute(route.id)}
              className={cn(
                'mt-5 w-full font-semibold py-3 rounded-xl text-sm transition-all duration-200 active:scale-95',
                isOther
                  ? 'border-2 border-forest text-forest hover:bg-forest hover:text-white'
                  : 'bg-amber hover:bg-amber-dark text-forest-dark',
              )}
            >
              {isOther ? t('otherCta') : t('book')}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
