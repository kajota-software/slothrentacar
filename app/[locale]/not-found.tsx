import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="min-h-screen bg-forest grain-overlay flex items-center justify-center text-center px-4">
      <div className="relative z-10">
        <span className="text-8xl block mb-6" aria-hidden="true">🦥</span>
        <h1 className="font-heading text-white text-3xl md:text-4xl font-bold mb-4">
          {t('title')}
        </h1>
        <p className="text-white/60 text-lg mb-8 max-w-sm mx-auto">
          {t('subtitle')}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-forest-dark font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  );
}
