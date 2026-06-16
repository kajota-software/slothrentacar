export default function SchemaOrg() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Sloth Rent a Car',
    description:
      'Alquiler de automóviles en Costa Rica. Flota moderna con seguro incluido, entrega en Turrialba y Aeropuerto Juan Santamaría (SJO).',
    url: 'https://slothrentacar.com',
    telephone: '+50671896080',
    email: 'info@slothrentacar.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plaza Nuri, frente a entrada principal del IET',
      addressLocality: 'Turrialba',
      addressRegion: 'Cartago',
      postalCode: '30501',
      addressCountry: 'CR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 9.9008,
      longitude: -83.6813,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '07:00',
      closes: '20:00',
    },
    sameAs: [
      'https://www.instagram.com/slothrentacar?igsh=aWd0YXdrdmV1Yzl6',
      'https://www.facebook.com/share/1KZYGLBHLb/',
    ],
    priceRange: '₡₡',
    currenciesAccepted: 'CRC, USD',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, SINPE',
    hasMap: 'https://maps.google.com/?q=Turrialba+Cartago+Costa+Rica',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
