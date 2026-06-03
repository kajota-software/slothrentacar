'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VehicleImageProps {
  slug: string;
  name: string;
  className?: string;
  priority?: boolean;
}

export default function VehicleImage({ slug, name, className = '', priority = false }: VehicleImageProps) {
  const [src, setSrc] = useState(`/images/${slug}/exterior-1.jpg`);
  const [usedFallback, setUsedFallback] = useState(false);

  function handleError() {
    if (!usedFallback) {
      setUsedFallback(true);
      // TODO: reemplazar con fotos reales del Drive del cliente
      setSrc('/images/webPlantilla.png');
    }
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      className={`object-cover ${className}`}
      onError={handleError}
      priority={priority}
      sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
