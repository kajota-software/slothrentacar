import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import FleetGrid from '@/components/FleetGrid';
import HowItWorks from '@/components/HowItWorks';
import Destinations from '@/components/Destinations';
import Testimonials from '@/components/Testimonials';
import About from '@/components/About';
import FAQ from '@/components/FAQ';
import SchemaOrg from '@/components/SchemaOrg';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === 'es'
        ? 'Sloth Rent a Car — Alquiler de Autos en Costa Rica'
        : 'Sloth Rent a Car — Car Rental in Costa Rica',
    description:
      locale === 'es'
        ? 'Alquila tu vehículo ideal en Costa Rica. Flota moderna, seguro incluido, entrega en Turrialba y Aeropuerto SJO. Reserva por WhatsApp.'
        : 'Rent your ideal vehicle in Costa Rica. Modern fleet, insurance included, delivery in Turrialba and SJO Airport. Book via WhatsApp.',
  };
}

export default function HomePage() {
  return (
    <>
      <SchemaOrg />
      <Hero />
      <TrustBar />
      <FleetGrid />
      <HowItWorks />
      <Destinations />
      <Testimonials />
      <About />
      <FAQ />
    </>
  );
}
