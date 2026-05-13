import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

import type { Locale } from '../../../lib/i18n';
import { buildMetadata } from '../../../lib/seo';

interface AboutParams {
  locale: Locale;
}

export async function generateMetadata({ params }: { params: AboutParams }): Promise<Metadata> {
  return buildMetadata({
    locale: params.locale,
    path: '/about',
    title: 'About — thebriefyard',
    description:
      'thebriefyard is a free practice-brief generator for designers. Human-curated. No AI. Inspired by Goodbrief.io.',
  });
}

export default function AboutPage({ params }: { params: AboutParams }) {
  unstable_setRequestLocale(params.locale);
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-bold text-4xl text-yard-primary">About thebriefyard</h1>
      <article className="mt-8 space-y-4 text-base leading-relaxed">
        <p>
          thebriefyard is a practice engine for designers. It generates combinatorial design briefs
          you can use as portfolio fuel, course assignments, or warm-up exercises. Every brief is
          deterministic — the seed in the URL means you and a friend see the same brief from the
          same link, every time, forever.
        </p>
        <p>
          The corpus is human-curated. No language model writes the slot entries; no machine
          translation produces the localized versions. The point is to practise against prose that a
          real client would write, not against the median of the internet.
        </p>
        <p>
          The project is inspired by{' '}
          <a className="underline text-yard-primary" href="https://goodbrief.io">
            Goodbrief.io
          </a>{' '}
          by Manuel Moreale, which has been the indie reference for combinatorial briefs since
          before AI generators existed. thebriefyard takes the same philosophical line — no AI in
          the loop — and adds permalinks, long-tail SEO, and a bilingual corpus.
        </p>
        <p>
          Code is MIT-licensed. The slot corpus is{' '}
          <a
            className="underline text-yard-primary"
            href="https://creativecommons.org/licenses/by-sa/4.0/"
          >
            CC BY-SA 4.0
          </a>
          . Both live in the open at{' '}
          <a className="underline text-yard-primary" href="https://github.com/Tibic4/thebriefyard">
            github.com/Tibic4/thebriefyard
          </a>
          .
        </p>
      </article>
    </main>
  );
}
