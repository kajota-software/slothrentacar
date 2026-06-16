import Image from 'next/image';

interface VehicleImageProps {
  image: string;
  name: string;
  className?: string;
  priority?: boolean;
}

export default function VehicleImage({ image, name, className = '', priority = false }: VehicleImageProps) {
  return (
    <div className={`relative w-full h-full bg-white ${className}`}>
      <Image
        src={image}
        alt={name}
        fill
        className="object-contain"
        priority={priority}
        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
