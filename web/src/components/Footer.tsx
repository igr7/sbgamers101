'use client';

import Link from 'next/link';

export default function Footer() {
  const categories = [
    { slug: 'gpu', name: 'Graphics Cards' },
    { slug: 'cpu', name: 'Processors' },
    { slug: 'monitor', name: 'Gaming Monitors' },
    { slug: 'keyboard', name: 'Gaming Keyboards' },
    { slug: 'mouse', name: 'Gaming Mouse' },
    { slug: 'headset', name: 'Gaming Headsets' },
  ];

  return (
    <footer className="mt-auto border-t-2 border-border bg-background">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="w-10 h-10 bg-foreground flex items-center justify-center">
                <span className="text-background font-black text-lg text-mono">SB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-foreground font-black text-2xl leading-none tracking-tight uppercase">SB Gamers</span>
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Price Tracker</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mb-6 font-medium">
              Advanced price tracking platform for gamers in Saudi Arabia. Track prices on Amazon.sa, verify real discounts, and never overpay for gaming gear.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-wider">
              <div className="w-2 h-2 bg-accent"></div>
              <span>Live Tracking</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-foreground font-black text-xs uppercase tracking-wider mb-6 border-l-2 border-accent pl-3">
              Categories
            </h4>
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="text-muted-foreground hover:text-accent text-sm transition-colors font-semibold uppercase tracking-wide"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-black text-xs uppercase tracking-wider mb-6 border-l-2 border-primary pl-3">
              Quick Links
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary text-sm transition-colors font-semibold uppercase tracking-wide"
              >
                Home
              </Link>
              <Link
                href="/deals"
                className="text-muted-foreground hover:text-primary text-sm transition-colors font-semibold uppercase tracking-wide"
              >
                Hot Deals
              </Link>
              <Link
                href="/categories"
                className="text-muted-foreground hover:text-primary text-sm transition-colors font-semibold uppercase tracking-wide"
              >
                All Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs leading-relaxed max-w-2xl text-center sm:text-left font-medium">
            <strong className="text-foreground font-black">DISCLAIMER:</strong> SB Gamers is not affiliated with Amazon.sa. All product names, logos, and brands are property of their respective owners. Prices and availability are subject to change.
          </p>
          <p className="text-muted-foreground text-xs shrink-0 font-bold uppercase tracking-wider">
            &copy; {new Date().getFullYear()} SB GAMERS
          </p>
        </div>
      </div>
    </footer>
  );
}
