import type { Metadata } from 'next';
import { Syne, Inter } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import Script from 'next/script';
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
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','1164961995814541');fbq('track','PageView');
        `}</Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }} alt="" src="https://www.facebook.com/tr?id=1164961995814541&ev=PageView&noscript=1" />
        </noscript>
      </body>
    </html>
  );
}
