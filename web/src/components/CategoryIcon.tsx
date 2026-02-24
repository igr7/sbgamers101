interface CategoryIconProps {
  slug: string;
  className?: string;
}

export default function CategoryIcon({ slug, className = "w-12 h-12" }: CategoryIconProps) {
  const icons: Record<string, JSX.Element> = {
    gpu: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="12" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M6 10h4M6 14h4M14 10h4M14 14h4" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M2 18v2M6 18v2M10 18v2M14 18v2M18 18v2M22 18v2" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    cpu: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="7" y="7" width="10" height="10" strokeLinecap="square" strokeLinejoin="miter" />
        <rect x="9" y="9" width="6" height="6" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M7 10H4M7 14H4M20 10h-3M20 14h-3M10 7V4M14 7V4M10 20v-3M14 20v-3" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    monitor: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M8 21h8M12 17v4" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    keyboard: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="12" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M6 10h1M10 10h1M14 10h1M18 10h1M8 14h8" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    mouse: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a7 7 0 00-7 7v6a7 7 0 0014 0V9a7 7 0 00-7-7z" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M12 2v6" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    headset: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 18v-6a9 9 0 0118 0v6" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    ram: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="6" width="18" height="12" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M7 10v4M11 10v4M15 10v4M19 10v4M3 14h18" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    ssd: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="16" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    motherboard: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" strokeLinecap="square" strokeLinejoin="miter" />
        <rect x="7" y="7" width="4" height="4" strokeLinecap="square" strokeLinejoin="miter" />
        <rect x="13" y="7" width="4" height="4" strokeLinecap="square" strokeLinejoin="miter" />
        <rect x="7" y="13" width="4" height="4" strokeLinecap="square" strokeLinejoin="miter" />
        <rect x="13" y="13" width="4" height="4" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    psu: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="6" width="16" height="12" strokeLinecap="square" strokeLinejoin="miter" />
        <circle cx="12" cy="12" r="3" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M12 9v6M9 12h6" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    case: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="2" width="12" height="20" strokeLinecap="square" strokeLinejoin="miter" />
        <circle cx="12" cy="6" r="1" fill="currentColor" />
        <rect x="9" y="10" width="6" height="4" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M9 18h6" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
    cooling: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M12 3v6M12 15v6M3 12h6M15 12h6M6.34 6.34l4.24 4.24M13.42 13.42l4.24 4.24M6.34 17.66l4.24-4.24M13.42 10.58l4.24-4.24" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
  };

  return icons[slug] || icons.gpu;
}
