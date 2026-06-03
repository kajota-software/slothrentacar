import type { Metadata } from 'next';
import { Syne, Inter } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Sloth Rent a Car — Alquiler de Autos en Costa Rica',
    template: '%s | Sloth Rent a Car',
  },
  description:
    'Alquila tu vehículo ideal en Costa Rica. Flota moderna, seguro incluido, entrega en Turrialba y Aeropuerto Juan Santamaría (SJO). Reserva por WhatsApp.',
  metadataBase: new URL('https://slothrentacar.com'),
  icons: {
    icon: '/images/LOGOSLOTH.png',
    shortcut: '/images/LOGOSLOTH.png',
    apple: '/images/LOGOSLOTH.png',
  },
  openGraph: {
    siteName: 'Sloth Rent a Car',
    locale: 'es_CR',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${syne.variable} ${inter.variable} scroll-smooth`}
    >
      <body className="antialiased bg-cream text-foreground font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
