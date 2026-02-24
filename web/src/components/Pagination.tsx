'use client';

import { useI18n } from '@/lib/i18n';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  const { t } = useI18n();
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm"
      >
        <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="square" strokeLinejoin="miter" d="M15 19l-7-7 7-7" />
        </svg>
        {t('common.prev')}
      </button>
      <span className="text-sm text-muted-foreground px-3 tabular-nums font-bold uppercase tracking-wider">
        {t('common.page')} {page} {t('common.of')} {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm"
      >
        {t('common.next')}
        <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="square" strokeLinejoin="miter" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
