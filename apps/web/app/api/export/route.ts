import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Not implemented',
      message:
        'PDF/PNG export is stubbed in P3. Full implementation lands in a later plan; ADR-005 still applies (@react-pdf/renderer for PDF, satori for PNG).',
      plan: 'post-P3',
    },
    { status: 501 },
  );
}
