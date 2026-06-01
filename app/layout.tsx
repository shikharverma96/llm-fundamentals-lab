import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'LLM Fundamentals Lab',
    template: '%s · LLM Fundamentals Lab',
  },
  description:
    'Interactive tools for the foundational mechanics of on-device and hosted LLMs: quantization tradeoffs, tokenizer comparison, and cost modeling.',
  applicationName: 'LLM Fundamentals Lab',
  authors: [{ name: 'Shikhar' }],
  keywords: ['LLM', 'quantization', 'tokenizer', 'cost calculator', 'on-device'],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-1.5 focus:shadow"
        >
          Skip to content
        </a>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main id="main" className="container flex-1 py-8 md:py-12">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
