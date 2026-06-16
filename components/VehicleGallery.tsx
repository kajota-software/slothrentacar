import Image from 'next/image';
import type { Vehicle } from '@/lib/fleet';

interface Props {
  vehicle: Vehicle;
}

export default function VehicleGallery({ vehicle }: Props) {
  return (
    <div className="relative w-full h-72 md:h-[420px] rounded-3xl overflow-hidden bg-white">
      <Image
        src={vehicle.image}
        alt={vehicle.name}
        fill
        className="object-contain"
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}
