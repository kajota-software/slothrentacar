'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface Props {
  text: string;
  /** Texto accesible del botón; por defecto "Más información" */
  label?: string;
  /** `dark` para fondos oscuros (forest) */
  tone?: 'light' | 'dark';
  className?: string;
}

const MARGIN = 12;
const MAX_WIDTH = 260;

/**
 * Ícono "?" con texto explicativo: hover en desktop, toque en mobile.
 * El globo se monta en un portal con posición fija para que no lo recorten
 * contenedores con overflow (p. ej. el cuerpo del modal).
 */
export default function InfoTip({ text, label, tone = 'light', className }: Props) {
  const t = useTranslations('infoTips');
  const id = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const hoverOpened = useRef(false);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number } | null>(null);

  function show() {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const width = Math.min(MAX_WIDTH, vw - MARGIN * 2);
    const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, MARGIN), vw - width - MARGIN);
    // Arriba si hay espacio; si no, abajo
    setPos(
      r.top > 140
        ? { left, width, bottom: window.innerHeight - r.top + 8 }
        : { left, width, top: r.bottom + 8 },
    );
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || tipRef.current?.contains(target)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label ?? t('label')}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          // Evita que, dentro de un <label>, el toque marque la casilla asociada
          e.preventDefault();
          e.stopPropagation();
          // Con mouse el hover ya lo abrió: el clic no debe cerrarlo
          if (open && hoverOpened.current) {
            hoverOpened.current = false;
            return;
          }
          if (open) setOpen(false);
          else show();
        }}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return;
          hoverOpened.current = true;
          show();
        }}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
        onBlur={() => setOpen(false)}
        className={cn(
          'relative inline-flex flex-none items-center justify-center w-[18px] h-[18px] rounded-full text-[11px] font-bold leading-none align-middle transition-colors',
          // Área táctil ampliada sin cambiar el tamaño visual
          "before:absolute before:-inset-3 before:content-['']",
          tone === 'dark'
            ? open
              ? 'bg-amber text-forest-dark'
              : 'bg-white/15 text-white hover:bg-amber hover:text-forest-dark'
            : open
              ? 'bg-forest text-white'
              : 'bg-forest/10 text-forest hover:bg-forest hover:text-white',
          className,
        )}
      >
        ?
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={tipRef}
            id={id}
            role="tooltip"
            style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
            className="fixed z-[70] rounded-xl bg-forest-dark text-white text-xs leading-relaxed font-normal normal-case tracking-normal text-left px-3.5 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] animate-[infotip-in_150ms_ease-out]"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
