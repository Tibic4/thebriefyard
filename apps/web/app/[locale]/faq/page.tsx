import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

import { JsonLd } from '../../../components/JsonLd';
import type { Locale } from '../../../lib/i18n';
import { buildFaqPage } from '../../../lib/jsonld';
import { buildMetadata } from '../../../lib/seo';

interface FaqParams {
  locale: Locale;
}

const FAQS: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: 'Is thebriefyard free?',
    answer:
      'Yes. The site is free and there is no paid tier planned for v1 or v2. Long-term funding may come from a single sponsor slot in the footer; the product itself stays free.',
  },
  {
    question: 'Do you use AI to write the briefs?',
    answer:
      'No. The slot corpus is human-authored. No language model fills the slots. We deliberately avoid the category "AI-generated briefs" — it is a different product.',
  },
  {
    question: 'Why are the briefs deterministic?',
    answer:
      'So that the URL becomes the brief. If you share a permalink, you and the recipient see the same brief — today, in a year, or in 2030. This is what makes a brief shareable and indexable by Google.',
  },
  {
    question: 'Can I use the corpus or briefs commercially?',
    answer:
      'The code is MIT. The slot corpus is CC BY-SA 4.0 — you can reuse it commercially, but derivative corpora must remain under the same license and credit the source.',
  },
  {
    question: 'Will there be more languages?',
    answer:
      'Portuguese (Brazil) ships in Phase 2 of v1. Spanish is on the roadmap once PT-BR shows traction. Other locales need search-volume evidence.',
  },
  {
    question: 'How do I report a bad slot entry?',
    answer:
      'Open an issue on GitHub. We review and replace; the forbidden-terms list is the floor, not the ceiling.',
  },
  {
    question: 'How do I contribute?',
    answer:
      'Public contribution is a v3 feature, gated on the corpus being stable for 6 months. Early collaborators can reach out via the email on the About page.',
  },
];

export async function generateMetadata({ params }: { params: FaqParams }): Promise<Metadata> {
  return buildMetadata({
    locale: params.locale,
    path: '/faq',
    title: 'FAQ — thebriefyard',
    description:
      'Common questions about thebriefyard, the free practice-brief generator for designers.',
  });
}

export default function FaqPage({ params }: { params: FaqParams }) {
  unstable_setRequestLocale(params.locale);
  const ld = buildFaqPage([...FAQS]);
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd data={ld} />
      <h1 className="font-bold text-4xl text-yard-primary">FAQ</h1>
      <dl className="mt-8 space-y-6">
        {FAQS.map((it) => (
          <div key={it.question}>
            <dt className="font-bold text-lg">{it.question}</dt>
            <dd className="mt-2 text-base leading-relaxed opacity-90">{it.answer}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
