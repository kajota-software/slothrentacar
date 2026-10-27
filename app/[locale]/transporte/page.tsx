import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { formatCRC } from '@/lib/utils';
import { minTransportPriceCRC, transportRules } from '@/lib/transport';
import FAQ from '@/components/FAQ';
import InfoTip from '@/components/InfoTip';
import RouteTimeline from '@/components/RouteTimeline';
import { TransportProvider } from '@/components/transport/TransportContext';
import TransportRoutes from '@/components/transport/TransportRoutes';
import TransportForm from '@/components/transport/TransportForm';
import {
  ArrowRightIcon,
  CalendarIcon,
  CarSideIcon,
  ClockIcon,
  HourglassIcon,
  KeyIcon,
  LuggageIcon,
  MapPinIcon,
  MessageIcon,
  MoonIcon,
  PlaneIcon,
  TagIcon,
  UsersIcon,
} from '@/components/icons';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'transport.meta' });
  return {
    // absolute: el título ya incluye "| Sloth Rent a Car"
    title: { absolute: t('title') },
    description: t('description'),
    alternates: {
      canonical: `/${locale}/transporte`,
      languages: { es: '/es/transporte', en: '/en/transporte' },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}/transporte`,
    },
  };
}

function SectionHeader({ label, title, subtitle, dark = false }: { label: string; title: string; subtitle?: string; dark?: boolean }) {
  return (
    <div className="text-center mb-10 md:mb-14">
      <p className="text-amber text-sm font-medium uppercase tracking-widest mb-3">{label}</p>
      <h2 className={`font-heading text-3xl md:text-5xl font-bold leading-tight ${dark ? 'text-white' : 'text-forest'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg max-w-xl mx-auto ${dark ? 'text-white/70' : 'text-forest-muted'}`}>{subtitle}</p>
      )}
    </div>
  );
}

const ctaPrimary =
  'inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-amber hover:bg-amber-dark text-forest-dark font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-amber/20';

export default async function TransportPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'transport' });
  const tTips = await getTranslations({ locale, namespace: 'infoTips' });
  const minPrice = formatCRC(minTransportPriceCRC());
  const addonPrice = formatCRC(transportRules.rentalAddonPriceCRC);

  const steps = t.raw('how.steps') as Array<{ title: string; desc: string }>;
  const stepIcons = [<CalendarIcon key="c" />, <MessageIcon key="m" />, <PlaneIcon key="p" />, <MapPinIcon key="mp" />];

  const details = [
    { icon: TagIcon, text: t('details.items.perTrip') },
    { icon: UsersIcon, text: t('details.items.maxPassengers', { n: transportRules.maxPassengers }) },
    {
      icon: LuggageIcon,
      text: t('details.items.luggage', {
        large: transportRules.maxLuggage.large,
        medium: transportRules.maxLuggage.medium,
      }),
    },
    { icon: MoonIcon, text: t('details.items.sameRate') },
    {
      icon: HourglassIcon,
      text: t('details.items.delay', { fee: transportRules.flightDelayFeeUSD }),
      tip: tTips('flightDelay'),
    },
    {
      icon: ClockIcon,
      text: t('details.items.notice', { hours: transportRules.minNoticeHours }),
      tip: tTips('notice'),
    },
  ];

  return (
    <TransportProvider>
      {/* 1. Hero */}
      <section id="hero" className="grain-overlay relative overflow-hidden bg-forest">
        <Image
          src="https://res.cloudinary.com/dv1klrgdi/image/upload/f_auto,q_auto/v1781592436/paisajeSloth_h4skdi.avif"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 70% 30%, rgba(45,106,79,0.5) 0%, transparent 60%), linear-gradient(to bottom, rgba(15,42,31,0.6) 0%, rgba(15,42,31,0.88) 100%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pt-40 md:pb-28 text-center">
          <p className="inline-flex items-center gap-2 text-amber text-sm font-medium uppercase tracking-widest mb-4">
            <PlaneIcon className="w-4 h-4" />
            {t('hero.label')}
          </p>
          <h1
            className="font-heading text-white font-bold leading-[1.08] tracking-tight"
            style={{ fontSize: 'clamp(2.25rem, 7vw, 4.5rem)' }}
          >
            {t('hero.title')}
          </h1>
          <p className="mt-6 text-white/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="mt-9">
            <a href="#reservar" className={ctaPrimary}>
              {t('hero.cta')}
              <ArrowRightIcon className="w-4 h-4 rotate-90" />
            </a>
            <p className="mt-4 text-white/70 text-sm">
              {t('hero.meta', { price: minPrice, max: transportRules.maxPassengers })}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Cómo funciona */}
      <section className="bg-cream py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label={t('how.label')} title={t('how.title')} subtitle={t('how.subtitle')} />
          <RouteTimeline steps={steps.map((s, i) => ({ ...s, icon: stepIcons[i] }))} />
        </div>
      </section>

      {/* 3. Dos formas de usar el servicio */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label={t('modes.label')} title={t('modes.title')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col rounded-3xl p-7 bg-cream border border-sand">
              <span className="w-12 h-12 rounded-2xl bg-forest text-amber flex items-center justify-center">
                <PlaneIcon className="w-6 h-6" />
              </span>
              <h3 className="mt-5 font-heading text-forest text-2xl font-bold">{t('modes.transportOnly.title')}</h3>
              <p className="mt-3 text-forest-muted leading-relaxed">{t('modes.transportOnly.desc')}</p>
              <a
                href="#reservar"
                className="mt-auto pt-6 inline-flex items-center gap-2 text-forest font-semibold hover:text-forest-light transition-colors"
              >
                {t('modes.bookCta')}
                <ArrowRightIcon className="w-4 h-4" />
              </a>
            </div>
            <div className="flex flex-col rounded-3xl p-7 bg-forest text-white grain-overlay">
              <span className="relative z-10 w-12 h-12 rounded-2xl bg-amber text-forest-dark flex items-center justify-center">
                <KeyIcon className="w-6 h-6" />
              </span>
              <h3 className="relative z-10 mt-5 font-heading text-2xl font-bold">{t('modes.withRental.title')}</h3>
              <p className="relative z-10 mt-3 text-white/75 leading-relaxed">
                {t('modes.withRental.desc', { price: addonPrice })}
              </p>
              <div className="relative z-10 mt-auto pt-6">
                <Link
                  href={{ pathname: '/', hash: 'fleet' }}
                  className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-forest-dark font-semibold px-6 py-3 rounded-full text-sm transition-all duration-200 active:scale-95"
                >
                  <CarSideIcon className="w-5 h-5" />
                  {t('modes.withRental.cta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Rutas y precios */}
      <section id="rutas" className="bg-cream py-20 md:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label={t('routes.label')} title={t('routes.title')} subtitle={t('routes.subtitle')} />
          <TransportRoutes />
        </div>
      </section>

      {/* 5. Detalles del servicio */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label={t('details.label')} title={t('details.title')} />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {details.map(({ icon: Icon, text, tip }) => (
              <li key={text} className="flex items-center gap-4 rounded-2xl bg-cream border border-sand p-4">
                <span className="flex-none w-11 h-11 rounded-xl bg-forest text-amber flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-forest font-medium text-sm sm:text-base leading-snug">
                  {text}
                  {tip && (
                    <>
                      {' '}
                      <InfoTip text={tip} className="ml-0.5 -mt-0.5" />
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Preguntas frecuentes */}
      <FAQ namespace="transport.faq" id="transport-faq" />

      {/* 7. Formulario */}
      <section id="reservar" className="relative bg-forest grain-overlay py-20 md:py-28 scroll-mt-16">
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label={t('form.label')} title={t('form.title')} subtitle={t('form.subtitle')} dark />
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-2xl">
            <TransportForm />
          </div>
        </div>
      </section>

      {/* 8. Cierre */}
      <section className="bg-sand-light py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-forest text-2xl md:text-4xl font-bold leading-tight">{t('closing.title')}</h2>
          <p className="mt-3 text-forest-muted text-lg">{t('closing.text')}</p>
          <a href="#reservar" className={`${ctaPrimary} mt-8`}>
            {t('closing.cta')}
            <ArrowRightIcon className="w-4 h-4 -rotate-90" />
          </a>
        </div>
      </section>
    </TransportProvider>
  );
}
