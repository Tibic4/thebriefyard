import { generateBrief } from '@briefyard/core';
import type { IndustryId, JobId } from '@briefyard/types';
import { INDUSTRY_IDS, JOB_IDS } from '@briefyard/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

import { JsonLd } from '../../../../../../components/JsonLd';
import type { Locale } from '../../../../../../lib/i18n';
import { buildBreadcrumbList, buildCreativeWork } from '../../../../../../lib/jsonld';
import { canonicalUrl, hubUrl, permalinkUrl } from '../../../../../../lib/routing';
import { buildMetadata } from '../../../../../../lib/seo';

interface PermalinkParams {
  locale: Locale;
  job: JobId;
  industry: IndustryId;
  seed: string;
}

const SEED_RE = /^[0-9a-z]{6}$/;

// ISR — seed is immutable for a fixed contentVersion. 1 year revalidate.
export const revalidate = 60 * 60 * 24 * 365;

export async function generateMetadata({ params }: { params: PermalinkParams }): Promise<Metadata> {
  const url = permalinkUrl({
    locale: params.locale,
    job: params.job,
    industry: params.industry,
    seed: params.seed,
  });
  return {
    ...buildMetadata({
      locale: params.locale,
      path: `/brief/${params.job}/${params.industry}/${params.seed}`,
      noindex: true,
    }),
    alternates: {
      canonical: url,
    },
  };
}

export default function PermalinkPage({ params }: { params: PermalinkParams }) {
  unstable_setRequestLocale(params.locale);
  if (!SEED_RE.test(params.seed)) notFound();
  if (!(JOB_IDS as readonly string[]).includes(params.job)) notFound();
  if (!(INDUSTRY_IDS as readonly string[]).includes(params.industry)) notFound();

  let brief;
  try {
    brief = generateBrief({
      job: params.job,
      industry: params.industry,
      locale: params.locale,
      seed: params.seed,
    });
  } catch {
    notFound();
  }

  const url = permalinkUrl({
    locale: params.locale,
    job: params.job,
    industry: params.industry,
    seed: params.seed,
  });
  const hub = hubUrl({ locale: params.locale, job: params.job, industry: params.industry });
  const breadcrumb = buildBreadcrumbList([
    { name: 'Home', url: canonicalUrl({ locale: params.locale, path: '/' }) },
    { name: `${params.job} × ${params.industry}`, url: hub },
    { name: brief.company.name, url },
  ]);
  const creative = buildCreativeWork({
    url,
    headline: brief.company.name,
    description: brief.company.description.slice(0, 160),
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd data={creative} />
      <JsonLd data={breadcrumb} />
      <nav aria-label="Breadcrumb" className="text-sm opacity-70">
        <a href={canonicalUrl({ locale: params.locale, path: '/' })}>Home</a>
        <span aria-hidden="true"> / </span>
        <a href={hub}>
          {params.job} × {params.industry}
        </a>
      </nav>
      <h1 className="mt-4 font-bold text-4xl text-yard-primary">{brief.company.name}</h1>
      <section className="mt-6">
        <h2 className="font-bold text-lg uppercase tracking-wider opacity-70">Brief</h2>
        <p className="mt-2 text-base leading-relaxed">{brief.company.description}</p>
      </section>
      <section className="mt-6">
        <h2 className="font-bold text-lg uppercase tracking-wider opacity-70">The job</h2>
        <p className="mt-2 text-base leading-relaxed">{brief.deliverable.description}</p>
      </section>
      <section className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="font-bold uppercase tracking-wider opacity-70">Audience</h3>
          <p className="mt-1">{brief.company.audience}</p>
        </div>
        <div>
          <h3 className="font-bold uppercase tracking-wider opacity-70">Deadline</h3>
          <p className="mt-1">{brief.deadline}</p>
        </div>
      </section>
      <p className="mt-12 text-xs opacity-60">
        Seed: {brief.seed} · Content version: {brief.contentVersion} · Ad-hoc permalink (noindex).
      </p>
    </main>
  );
}
