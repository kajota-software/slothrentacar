'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleSwitch() {
    const next = locale === 'es' ? 'en' : 'es';
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      className="text-white/80 hover:text-amber text-sm font-medium transition-colors duration-200 px-2 py-1"
      aria-label={`Switch to ${locale === 'es' ? 'English' : 'Español'}`}
    >
      {t('langSwitch')}
    </button>
  );
}
