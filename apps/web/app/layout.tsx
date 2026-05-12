import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'thebriefyard — Practice briefs for designers',
  description:
    'Human-curated combinatorial design briefs. Practice your portfolio with reproducible, shareable briefs. No AI, no paywall.',
  metadataBase: new URL('https://thebriefyard.com'),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
