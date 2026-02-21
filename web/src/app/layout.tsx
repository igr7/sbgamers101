import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SB Gamers | Best Gaming Prices in Saudi Arabia',
  description:
    'Compare gaming product prices on Amazon.sa. Track price history, verify discounts, and find the best deals on CPUs, GPUs, monitors, peripherals, and more.',
  keywords: 'gaming, price comparison, Saudi Arabia, amazon.sa, PC components, gaming deals, GPU prices, CPU prices',
  openGraph: {
    title: 'SB Gamers | Best Gaming Prices in Saudi Arabia',
    description: 'Compare prices. Track history. Find real deals.',
    url: 'https://sbgamers.com',
    siteName: 'SB Gamers',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <head>
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
