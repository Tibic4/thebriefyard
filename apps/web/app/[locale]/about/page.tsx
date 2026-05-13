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
      'thebriefyard is a free practice-brief generator for designers. Combinatorial, deterministic permalinks, human-curated corpus. No LLM in the runtime. Inspired by Goodbrief.io.',
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
          The corpus is human-curated. The runtime generator has no LLM in its dependency tree — it
          is pure combinatorial slot grammar with a seeded PRNG. The seed in the URL is the brief.
        </p>
        <p>
          Honest disclosure: the slot entries themselves are drafted with AI assistance and reviewed
          entry-by-entry by the founder before they land on `main` (see{' '}
          <a
            className="underline text-yard-primary"
            href="https://github.com/Tibic4/thebriefyard/blob/main/docs/landscape-decisions/LD-013-ai-drafted-corpus-human-curated.md"
          >
            LD-013
          </a>
          ). What you see on this site has been sight-read. Machine translation is forbidden — PT
          entries are authored, not translated.
        </p>
        <p>
          The project is inspired by{' '}
          <a className="underline text-yard-primary" href="https://goodbrief.io">
            Goodbrief.io
          </a>{' '}
          by Manuel Moreale, which has been the indie reference for combinatorial briefs since
          before AI generators existed. thebriefyard takes the same architectural line — no LLM in
          the request path — and adds permalinks, long-tail SEO, and a bilingual corpus.
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
