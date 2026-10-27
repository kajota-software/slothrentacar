'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { CarTopIcon } from './icons';
import { cn } from '@/lib/utils';

export interface TimelineStep {
  title: string;
  desc: string;
  icon: ReactNode;
}

interface Geometry {
  top: number;         // centro del primer marcador (px desde el contenedor)
  height: number;      // distancia hasta el centro del último marcador
  thresholds: number[]; // progreso (0–1) en el que se alcanza cada paso
}

const CAR_SIZE = 44;

/**
 * Pasos conectados por una línea vertical que se "dibuja" con el scroll.
 * Un carro (visto desde arriba, mirando hacia abajo) viaja en la punta de la línea
 * y cada paso se activa al alcanzarlo. Solo anima transform y opacity.
 * Con prefers-reduced-motion: línea completa, carro fijo al final, todo activo.
 */
export default function RouteTimeline({ steps }: { steps: TimelineStep[] }) {
  const containerRef = useRef<HTMLOListElement>(null);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const geoRef = useRef<Geometry | null>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 50%'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const carY = useTransform(progress, (v) => v * (geoRef.current?.height ?? 0));

  function updateActive(v: number) {
    const g = geoRef.current;
    if (!g) return;
    setActiveCount(g.thresholds.filter((th) => v >= th - 0.01).length);
  }

  useMotionValueEvent(progress, 'change', updateActive);

  // Mide la posición real de cada marcador (los pasos tienen alturas distintas)
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const base = container.getBoundingClientRect().top;
      const centers = markerRefs.current
        .filter((el): el is HTMLSpanElement => !!el)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return r.top + r.height / 2 - base;
        });
      if (centers.length < 2) return;
      const top = centers[0];
      const height = centers[centers.length - 1] - top;
      const next = { top, height, thresholds: centers.map((c) => (c - top) / height) };
      geoRef.current = next;
      setGeo(next);
      updateActive(progress.get());
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length]);

  const allActive = reduceMotion === true;

  return (
    <ol ref={containerRef} className="relative">
      {/* Riel, línea de progreso y carro */}
      {geo && (
        <div
          className="pointer-events-none absolute left-[22px] w-0 animate-[infotip-in_300ms_ease-out]"
          style={{ top: geo.top, height: geo.height }}
          aria-hidden="true"
        >
          <span className="absolute -left-px top-0 h-full w-0.5 rounded-full bg-forest/15" />
          {allActive ? (
            <span className="absolute -left-px top-0 h-full w-0.5 rounded-full bg-forest" />
          ) : (
            <motion.span
              className="absolute -left-px top-0 h-full w-0.5 rounded-full bg-forest origin-top"
              style={{ scaleY: progress }}
            />
          )}
          <motion.span
            className="absolute flex items-center justify-center rounded-full bg-amber text-forest-dark shadow-[0_6px_18px_rgba(15,42,31,0.28)] ring-4 ring-cream will-change-transform"
            style={{
              width: CAR_SIZE,
              height: CAR_SIZE,
              left: -CAR_SIZE / 2,
              top: -CAR_SIZE / 2,
              y: allActive ? geo.height : carY,
            }}
          >
            <CarTopIcon className="w-6 h-6" strokeWidth={1.9} />
          </motion.span>
        </div>
      )}

      {steps.map((step, i) => {
        const active = allActive || i < activeCount;
        return (
          <li key={i} className="relative grid grid-cols-[44px_1fr] gap-x-4 sm:gap-x-6 pb-10 last:pb-0">
            {/* Marcador sobre el riel */}
            <div className="flex justify-center pt-[14px]">
              <span
                ref={(el) => {
                  markerRefs.current[i] = el;
                }}
                className="relative block w-4 h-4 rounded-full bg-cream border-2 border-forest/25"
              >
                <span
                  className={cn(
                    'absolute -inset-[2px] rounded-full bg-forest transition-[opacity,transform] duration-500',
                    active ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
                  )}
                />
              </span>
            </div>

            {/* Contenido */}
            <div className="flex items-start gap-4">
              <span className="relative flex-none w-11 h-11 rounded-2xl" aria-hidden="true">
                <span className="absolute inset-0 rounded-2xl bg-white border border-sand flex items-center justify-center text-forest-muted [&>svg]:w-5 [&>svg]:h-5">
                  {step.icon}
                </span>
                <span
                  className={cn(
                    'absolute inset-0 rounded-2xl bg-forest flex items-center justify-center text-amber [&>svg]:w-5 [&>svg]:h-5 transition-opacity duration-500',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  {step.icon}
                </span>
              </span>
              <div className="pt-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-dark">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-heading text-forest font-semibold text-lg leading-snug mt-0.5">
                  {step.title}
                </h3>
                <p className="text-forest-muted text-sm leading-relaxed mt-1.5">{step.desc}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
