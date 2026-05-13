import { generateBrief } from '@briefyard/core';
import { IndustryId, JobId, LocaleId } from '@briefyard/types';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({
  job: JobId,
  industry: IndustryId,
  locale: LocaleId,
});

export async function POST(req: Request) {
  const userAgent = req.headers.get('user-agent');
  if (!userAgent || userAgent.trim() === '') {
    return NextResponse.json({ error: 'User-Agent header required' }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.format() },
      { status: 400 },
    );
  }

  try {
    const brief = generateBrief(parsed.data);
    return NextResponse.json({
      seed: brief.seed,
      brief,
      url: `/brief/${brief.job}/${brief.industry}/${brief.seed}`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
