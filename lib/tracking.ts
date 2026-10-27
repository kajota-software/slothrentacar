declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Evento Lead del pixel de Meta — solo si el pixel cargó */
export function trackLead(contentName: string): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', { content_name: contentName });
  }
}
