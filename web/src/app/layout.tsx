import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SB Gamers - Best Gaming Prices in Saudi Arabia | Amazon.sa Price Tracker',
  description:
    'Track gaming product prices on Amazon.sa in real-time. Find verified discounts on GPUs, CPUs, monitors, keyboards, and more. Never overpay for gaming gear again.',
  keywords: 'gaming prices, Saudi Arabia, amazon.sa, price tracker, GPU deals, gaming gear, PC components, RTX 4090, gaming monitors',
  openGraph: {
    title: 'SB Gamers - Best Gaming Prices in Saudi Arabia',
    description: 'Track prices, verify discounts, and find the best gaming deals on Amazon.sa.',
    url: 'https://sbgamers.com',
    siteName: 'SB Gamers',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SB Gamers - Best Gaming Prices in Saudi Arabia',
    description: 'Track prices, verify discounts, and find the best gaming deals on Amazon.sa.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#08080c" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#08080c] text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
