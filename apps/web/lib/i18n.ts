import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'pt'] as const;
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();
  const messages = (await import(`../messages/${locale}.json`)).default;
  return { messages };
});
