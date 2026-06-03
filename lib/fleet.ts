export interface Luggage {
  large: number;
  carryOn: number;
}

export interface Vehicle {
  slug: string;
  name: string;
  year: number;
  type: string;
  drive: string;
  transmission: string;
  passengers: number;
  luggage: Luggage;
  pricePerDayCRC: number;
  deposit: number; // USD
  category: 'economy' | 'suv';
  note: string | null;
}

export const fleet: Vehicle[] = [
  {
    slug: 'toyota-agya-2021',
    name: 'Toyota Agya',
    year: 2021,
    type: 'hatchback',
    drive: '2WD',
    transmission: 'automatic',
    passengers: 4,
    luggage: { large: 1, carryOn: 2 },
    pricePerDayCRC: 29000,
    deposit: 400,
    category: 'economy',
    note: null,
  },
  {
    slug: 'suzuki-swift-2024',
    name: 'Suzuki Swift',
    year: 2024,
    type: 'sedan',
    drive: '2WD',
    transmission: 'automatic',
    passengers: 5,
    luggage: { large: 1, carryOn: 2 },
    pricePerDayCRC: 35000,
    deposit: 400,
    category: 'economy',
    note: null,
  },
  {
    slug: 'hyundai-venue-2021',
    name: 'Hyundai Venue',
    year: 2021,
    type: 'SUV',
    drive: '4x2',
    transmission: 'automatic',
    passengers: 5,
    luggage: { large: 3, carryOn: 3 },
    pricePerDayCRC: 40000,
    deposit: 500,
    category: 'suv',
    note: null,
  },
  {
    slug: 'suzuki-vitara-2024',
    name: 'Suzuki Vitara',
    year: 2024,
    type: 'SUV',
    drive: '4x4',
    transmission: 'automatic',
    passengers: 5,
    luggage: { large: 3, carryOn: 3 },
    pricePerDayCRC: 45000,
    deposit: 500,
    category: 'suv',
    note: null,
  },
  {
    slug: 'toyota-rush-2023',
    name: 'Toyota Rush',
    year: 2023,
    type: 'SUV',
    drive: '4x2',
    transmission: 'automatic',
    passengers: 7,
    luggage: { large: 3, carryOn: 3 },
    pricePerDayCRC: 45000,
    deposit: 500,
    category: 'suv',
    note: null,
  },
  {
    slug: 'hyundai-santa-fe-2018',
    name: 'Hyundai Santa Fe',
    year: 2018,
    type: 'SUV',
    drive: '4x4',
    transmission: 'automatic',
    passengers: 7,
    luggage: { large: 3, carryOn: 3 },
    pricePerDayCRC: 50000,
    deposit: 500,
    category: 'suv',
    note: 'availability-limited',
  },
];

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return fleet.find((v) => v.slug === slug);
}

export function getRelatedVehicles(currentSlug: string, count = 3): Vehicle[] {
  const current = getVehicleBySlug(currentSlug);
  if (!current) return fleet.slice(0, count);
  return fleet.filter((v) => v.slug !== currentSlug).slice(0, count);
}

export const vehicleEditorial: Record<string, { es: string; en: string }> = {
  'toyota-agya-2021': {
    es: 'Perfecto para parejas o viajeros que recorren ciudad y zonas costeras. Su tamaño compacto facilita el estacionamiento y su bajo consumo de combustible lo convierte en la opción más económica de nuestra flota.',
    en: 'Perfect for couples or travelers exploring cities and coastal areas. Its compact size makes parking easy, and its fuel efficiency makes it the most economical choice in our fleet.',
  },
  'suzuki-swift-2024': {
    es: 'El Swift 2024 combina estilo moderno con comodidad para cinco pasajeros. Ideal para grupos pequeños que quieren disfrutar las rutas costeras de Costa Rica con confort y eficiencia.',
    en: 'The 2024 Swift combines modern style with comfort for five passengers. Ideal for small groups wanting to enjoy Costa Rica\'s coastal routes in comfort and efficiency.',
  },
  'hyundai-venue-2021': {
    es: 'La opción SUV más accesible de nuestra flota. Con mayor altura al suelo que un sedán, el Venue maneja bien caminos secundarios y es una excelente alternativa para familias de hasta 5 personas.',
    en: 'The most accessible SUV option in our fleet. With higher ground clearance than a sedan, the Venue handles secondary roads well and is an excellent choice for families of up to 5.',
  },
  'suzuki-vitara-2024': {
    es: 'Nuestra recomendación estrella para aventureros. La tracción 4x4 del Vitara 2024 te permite explorar con confianza los caminos de Monteverde, La Fortuna y los destinos de montaña más remotos de Costa Rica.',
    en: 'Our top recommendation for adventurers. The 2024 Vitara\'s 4x4 traction lets you confidently explore Monteverde, La Fortuna, and Costa Rica\'s most remote mountain destinations.',
  },
  'toyota-rush-2023': {
    es: 'Diseñado para familias y grupos de hasta 7 personas. El Rush 2023 ofrece espacio generoso tanto para pasajeros como para equipaje, perfecto para tours grupales y aventuras familiares por toda Costa Rica.',
    en: 'Designed for families and groups of up to 7. The 2023 Rush offers generous space for both passengers and luggage, perfect for group tours and family adventures across Costa Rica.',
  },
  'hyundai-santa-fe-2018': {
    es: 'El vehículo premium de nuestra flota. El Santa Fe combina tracción 4x4, capacidad para 7 pasajeros y un interior espacioso y refinado. La elección ideal para quienes no quieren renunciar al confort en ninguna ruta.',
    en: 'The premium vehicle in our fleet. The Santa Fe combines 4x4 traction, 7-passenger capacity, and a spacious, refined interior. The ideal choice for those who refuse to sacrifice comfort on any route.',
  },
};
