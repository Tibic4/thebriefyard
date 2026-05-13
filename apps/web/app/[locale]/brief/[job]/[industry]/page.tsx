import { readCorpus } from '@briefyard/content';
import type { IndustryId, JobId } from '@briefyard/types';
import { INDUSTRY_IDS, JOB_IDS } from '@briefyard/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

import { JsonLd } from '../../../../../components/JsonLd';
import type { Locale } from '../../../../../lib/i18n';
import { locales } from '../../../../../lib/i18n';
import { buildBreadcrumbList, buildCollectionPage } from '../../../../../lib/jsonld';
import { canonicalUrl, hubUrl } from '../../../../../lib/routing';
import { buildMetadata } from '../../../../../lib/seo';

interface HubParams {
  locale: Locale;
  job: JobId;
  industry: IndustryId;
}

function safeReadCorpus(locale: Locale) {
  try {
    return readCorpus(locale);
  } catch {
    // Locale has no corpus authored yet (PT-BR until Phase 2 of v1).
    return null;
  }
}

export function generateStaticParams(): HubParams[] {
  const out: HubParams[] = [];
  for (const locale of locales) {
    const corpus = safeReadCorpus(locale);
    if (!corpus) continue;
    for (const job of JOB_IDS) {
      if (!corpus.jobs[job]) continue;
      for (const industry of INDUSTRY_IDS) {
        if (!corpus.industries[industry]) continue;
        out.push({ locale, job, industry });
      }
    }
  }
  return out;
}

export async function generateMetadata({ params }: { params: HubParams }): Promise<Metadata> {
  const corpus = safeReadCorpus(params.locale);
  const industry = corpus?.industries[params.industry];
  const job = corpus?.jobs[params.job];
  if (!industry || !job) return {};
  return buildMetadata({
    locale: params.locale,
    path: `/brief/${params.job}/${params.industry}`,
    title: industry.seoTitle,
    description: industry.seoDescription,
  });
}

export default function HubPage({ params }: { params: HubParams }) {
  unstable_setRequestLocale(params.locale);
  // Reject unknown job/industry IDs early.
  if (!(JOB_IDS as readonly string[]).includes(params.job)) notFound();
  if (!(INDUSTRY_IDS as readonly string[]).includes(params.industry)) notFound();

  const corpus = safeReadCorpus(params.locale);
  const industry = corpus?.industries[params.industry];
  const job = corpus?.jobs[params.job];

  // EN must have both. PT may serve a placeholder while corpus is authored (Phase 2 of v1).
  if (params.locale === 'en' && (!industry || !job)) notFound();

  const url = hubUrl({ locale: params.locale, job: params.job, industry: params.industry });
  const displayJob = job?.displayName ?? params.job;
  const displayIndustry = industry?.displayName ?? params.industry;
  const breadcrumb = buildBreadcrumbList([
    { name: 'Home', url: canonicalUrl({ locale: params.locale, path: '/' }) },
    { name: `${displayJob} × ${displayIndustry}`, url },
  ]);
  const collection = buildCollectionPage({
    locale: params.locale,
    path: `/brief/${params.job}/${params.industry}`,
    name: `${displayJob} briefs for ${displayIndustry}`,
    description: industry?.seoDescription ?? '',
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd data={collection} />
      <JsonLd data={breadcrumb} />
      <nav aria-label="Breadcrumb" className="text-sm opacity-70">
        <a href={canonicalUrl({ locale: params.locale, path: '/' })}>Home</a>
        <span aria-hidden="true"> / </span>
        <span>
          {displayJob} × {displayIndustry}
        </span>
      </nav>
      <h1 className="mt-4 font-bold text-4xl text-yard-primary">
        {displayJob} briefs for {displayIndustry}
      </h1>
      {industry && job ? (
        <>
          <article className="mt-8 prose-like">
            <p className="text-base leading-relaxed">{industry.blurb}</p>
            <p className="mt-6 text-base leading-relaxed">{job.blurb}</p>
          </article>
          <section className="mt-12">
            <h2 className="font-bold text-2xl">Try it</h2>
            <p className="mt-2 text-sm opacity-70">
              Curated examples ship in P4. For now, generate an ad-hoc brief — the seed in the URL
              makes it shareable forever.
            </p>
          </section>
        </>
      ) : (
        <p className="mt-8 text-base">
          Conteúdo em PT-BR está no roadmap. A infraestrutura está pronta; o corpus está sendo
          escrito.
        </p>
      )}
    </main>
  );
}
