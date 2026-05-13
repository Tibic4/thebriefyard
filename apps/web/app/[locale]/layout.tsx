import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { locales, type Locale } from '../../lib/i18n';
import '../globals.css';

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'thebriefyard — Practice briefs for designers',
  description:
    'Human-curated combinatorial design briefs. Practice your portfolio with reproducible, shareable briefs. No AI, no paywall.',
  metadataBase: new URL('https://thebriefyard.com'),
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  if (!locales.includes(params.locale)) notFound();
  unstable_setRequestLocale(params.locale);
  const messages = await getMessages();
  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
