import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { fleet, getVehicleBySlug, getRelatedVehicles, vehicleEditorial } from '@/lib/fleet';
import { isSantaFeAvailable } from '@/lib/utils';
import VehicleGallery from '@/components/VehicleGallery';
import FleetCard from '@/components/FleetCard';
import VehicleBooking from '@/components/VehicleBooking';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const locales = ['es', 'en'];
  return locales.flatMap((locale) =>
    fleet.map((vehicle) => ({ locale, slug: vehicle.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) return {};

  return {
    title:
      locale === 'es'
        ? `${vehicle.name} ${vehicle.year} — Alquiler en Costa Rica`
        : `${vehicle.name} ${vehicle.year} — Rental in Costa Rica`,
    description:
      locale === 'es'
        ? `Alquila el ${vehicle.name} ${vehicle.year} en Costa Rica. ${vehicle.passengers} pasajeros, ${vehicle.drive}. ₡${vehicle.pricePerDayCRC.toLocaleString()}/día.`
        : `Rent the ${vehicle.name} ${vehicle.year} in Costa Rica. ${vehicle.passengers} passengers, ${vehicle.drive}. ₡${vehicle.pricePerDayCRC.toLocaleString()}/day.`,
    openGraph: {
      title: `${vehicle.name} ${vehicle.year} — Sloth Rent a Car`,
      images: [`/images/${vehicle.slug}/exterior-1.jpg`],
    },
  };
}

export default async function VehiclePage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'vehicle' });

  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const related = getRelatedVehicles(slug, 3);
  const editorial = vehicleEditorial[vehicle.slug];
  const editorialText = locale === 'es' ? editorial?.es : editorial?.en;
  const isLimited = vehicle.note === 'availability-limited' && !isSantaFeAvailable();
  const includedItems = t.raw('includedItems') as string[];

  const specs = [
    { label: t('passengers'), value: vehicle.passengers },
    {
      label: t('transmission'),
      value: vehicle.transmission === 'automatic' ? t('automatic') : 'Manual',
    },
    { label: t('drive'), value: vehicle.drive },
    {
      label: t('luggage'),
      value: `${vehicle.luggage.large} ${vehicle.luggage.large === 1 ? t('largeBags') : t('largeBagsPlural')} · ${vehicle.luggage.carryOn} ${vehicle.luggage.carryOn === 1 ? t('carryOns') : t('carryOnsPlural')}`,
    },
    { label: t('category'), value: vehicle.category === 'economy' ? t('economy') : 'SUV' },
    { label: t('deposit'), value: `$${vehicle.deposit} USD` },
  ];

  return (
    <div className="bg-cream min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-forest-muted hover:text-forest text-sm font-medium mb-8 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
          {t('back')}
        </Link>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery — client component */}
          <div>
            <VehicleGallery vehicle={vehicle} />
          </div>

          {/* Details */}
          <div>
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  vehicle.category === 'economy'
                    ? 'bg-forest/10 text-forest'
                    : 'bg-forest text-white'
                }`}
              >
                {vehicle.category === 'economy' ? t('economy') : 'SUV'}
              </span>
              {vehicle.drive === '4x4' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber text-forest-dark">
                  4×4
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-heading text-forest text-4xl md:text-5xl font-bold leading-tight">
              {vehicle.name}
            </h1>
            <p className="text-forest-muted text-lg mt-1">
              {vehicle.year} · {vehicle.type}
            </p>

            {/* Specs */}
            <div className="mt-8 rounded-2xl border border-sand overflow-hidden bg-white">
              <div className="grid grid-cols-2">
                {specs.map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={[
                      'px-5 py-4',
                      i % 2 === 0 ? 'border-r border-sand' : '',
                      i < specs.length - 2 ? 'border-b border-sand' : '',
                    ].join(' ')}
                  >
                    <p className="text-[11px] text-forest-muted font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-forest font-semibold mt-1 leading-snug">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Client booking component (price + modal trigger) */}
            <VehicleBooking
              vehicle={vehicle}
              isLimited={isLimited}
            />

            {/* Editorial */}
            {editorialText && (
              <div className="mt-6">
                <h3 className="font-heading text-forest font-semibold text-base mb-2">
                  {t('idealFor')}
                </h3>
                <p className="text-forest-muted leading-relaxed text-sm">{editorialText}</p>
              </div>
            )}
          </div>
        </div>

        {/* What's included */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-7 border border-sand">
            <h2 className="font-heading text-forest text-xl font-bold mb-5">{t('included')}</h2>
            <ul className="space-y-3">
              {includedItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 text-forest-light flex-none mt-0.5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-forest-dark text-sm">{item}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 border-t border-sand pt-3 mt-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 text-red-400 flex-none mt-0.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-forest-dark text-sm">{t('deductible')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-forest rounded-3xl p-7 text-white">
            <h2 className="font-heading text-white text-xl font-bold mb-5">
              {t('extrasAvailable')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{t('zeroDeductible')}</p>
                  <p className="text-white/60 text-sm mt-0.5">Elimina el deducible de $800</p>
                </div>
                <span className="bg-amber text-forest-dark font-bold text-sm px-3 py-1.5 rounded-xl">
                  {t('zeroDeductiblePrice')}
                </span>
              </div>
              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{t('childSeat')}</p>
                  <p className="text-white/60 text-sm mt-0.5">Silla homologada para niños</p>
                </div>
                <span className="bg-amber text-forest-dark font-bold text-sm px-3 py-1.5 rounded-xl">
                  {t('childSeatPrice')}
                </span>
              </div>
            </div>
            {/* The inline book button is rendered by VehicleBooking (same modal instance) */}
            <div id="vehicle-extras-book" />
          </div>
        </div>

        {/* Related */}
        <div className="mt-20">
          <h2 className="font-heading text-forest text-2xl md:text-3xl font-bold mb-8">
            {t('relatedTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((v, i) => (
              <FleetCard key={v.slug} vehicle={v} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
