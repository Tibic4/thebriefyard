import { CONTENT_VERSION } from '@briefyard/content';
import { INDUSTRY_IDS, JOB_IDS } from '@briefyard/types';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import type { Locale } from '../../lib/i18n';

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations();
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-bold text-4xl text-yard-primary">{t('site.title')}</h1>
      <p className="mt-4 text-lg">{t('site.tagline')}</p>
      <p className="mt-8 text-sm opacity-70">
        Content version {CONTENT_VERSION}. {JOB_IDS.length} jobs × {INDUSTRY_IDS.length} industries
        planned. Locale: {params.locale}.
      </p>
    </main>
  );
}
