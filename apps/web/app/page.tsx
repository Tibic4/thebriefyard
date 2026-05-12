import { CONTENT_VERSION } from '@briefyard/content';
import { JOB_IDS, INDUSTRY_IDS } from '@briefyard/types';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-bold text-4xl text-yard-primary">thebriefyard</h1>
      <p className="mt-4 text-lg">
        Practice briefs for designers. Human-curated. Reproducible. Shareable.
      </p>
      <p className="mt-8 text-sm opacity-70">
        Foundation scaffold. Content version {CONTENT_VERSION}. {JOB_IDS.length} jobs ×{' '}
        {INDUSTRY_IDS.length} industries planned.
      </p>
    </main>
  );
}
