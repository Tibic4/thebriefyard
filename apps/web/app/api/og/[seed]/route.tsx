/* eslint-disable react/no-unknown-property */
import { ImageResponse } from 'next/og';

// Edge runtime is preferred (ADR-005). We avoid importing @briefyard/core here
// because that path pulls in `node:fs` for corpus loading. Instead, the caller
// pre-generates the brief and passes the rendered fragments via query string.
// The hub/permalink pages compute these once and reference the OG URL with the
// fragments baked in. Cache-Control: 1 year (immutable for fixed contentVersion).
export const runtime = 'edge';

const SEED_RE = /^[0-9a-z]{6}$/;

export async function GET(req: Request, { params }: { params: { seed: string } }) {
  if (!SEED_RE.test(params.seed)) {
    return new Response('Bad seed', { status: 400 });
  }
  const url = new URL(req.url);
  const name = url.searchParams.get('name') ?? 'thebriefyard';
  const description = url.searchParams.get('description') ?? '';
  const job = url.searchParams.get('job') ?? '';
  const industry = url.searchParams.get('industry') ?? '';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px',
        backgroundColor: '#FAF6EF',
        color: '#1A1A1A',
      }}
    >
      <div style={{ fontSize: 28, color: '#C2410C', fontWeight: 700, display: 'flex' }}>
        thebriefyard
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, display: 'flex' }}>
          {name}
        </div>
        <div style={{ fontSize: 28, opacity: 0.75, lineHeight: 1.3, display: 'flex' }}>
          {description.slice(0, 140)}
          {description.length > 140 ? '…' : ''}
        </div>
      </div>
      <div style={{ fontSize: 20, opacity: 0.6, display: 'flex' }}>
        {job} · {industry} · seed {params.seed}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  );
}
