import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

import type { Locale } from '../../../lib/i18n';
import { buildMetadata } from '../../../lib/seo';

interface NewsletterParams {
  locale: Locale;
}

export async function generateMetadata({
  params,
}: {
  params: NewsletterParams;
}): Promise<Metadata> {
  return buildMetadata({
    locale: params.locale,
    path: '/newsletter',
    title: 'Newsletter — thebriefyard',
    description:
      'Occasional updates about the corpus, new locales, and curated briefs of the month. No spam.',
  });
}

export default function NewsletterPage({ params }: { params: NewsletterParams }) {
  unstable_setRequestLocale(params.locale);
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-bold text-4xl text-yard-primary">Newsletter</h1>
      <p className="mt-4 text-base">
        Occasional updates about new corpus entries, new locales, and the curated brief of the
        month. No spam, no tracking. Hosted by Buttondown.
      </p>
      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        action="https://buttondown.com/api/emails/embed-subscribe/thebriefyard"
        method="post"
        target="popupwindow"
      >
        <label className="sr-only" htmlFor="bd-email">
          Email
        </label>
        <input
          id="bd-email"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="flex-1 rounded border border-yard-fog px-4 py-2 text-base"
        />
        <button
          type="submit"
          className="rounded bg-yard-primary px-6 py-2 font-bold text-yard-cream"
        >
          Subscribe
        </button>
      </form>
      <p className="mt-4 text-xs opacity-60">
        We use Buttondown for delivery. No marketing pixels, no GA, no cookies set by us.
      </p>
    </main>
  );
}
