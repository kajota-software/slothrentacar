'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Vehicle } from '@/lib/fleet';

const IMAGE_TYPES = ['exterior-1', 'interior', 'trunk'] as const;

interface Props {
  vehicle: Vehicle;
}

export default function VehicleGallery({ vehicle }: Props) {
  const [active, setActive] = useState(0);
  const [srcs, setSrcs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    IMAGE_TYPES.forEach((type) => {
      initial[type] = `/images/${vehicle.slug}/${type}.jpg`;
    });
    return initial;
  });
  const [usedFallback, setUsedFallback] = useState<Record<string, boolean>>({});

  function handleError(type: string) {
    if (!usedFallback[type]) {
      setUsedFallback((prev) => ({ ...prev, [type]: true }));
      // TODO: reemplazar con fotos reales del Drive del cliente
      setSrcs((prev) => ({ ...prev, [type]: '/images/webPlantilla.png' }));
    }
  }

  const images = IMAGE_TYPES.map((type) => ({
    type,
    src: srcs[type],
    alt: `${vehicle.name} — ${type.replace('-', ' ')}`,
  }));

  return (
    <div>
      {/* Main image */}
      <div className="relative w-full h-72 md:h-[420px] rounded-3xl overflow-hidden bg-sand">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[active].src}
              alt={images[active].alt}
              fill
              className="object-cover"
              priority
              onError={() => handleError(images[active].type)}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 mt-3">
        {images.map((img, i) => (
          <button
            key={img.type}
            onClick={() => setActive(i)}
            className={`relative flex-1 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-sand ${
              active === i ? 'border-forest shadow-md' : 'border-transparent opacity-60 hover:opacity-90'
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              onError={() => handleError(img.type)}
              sizes="120px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
