'use client';

import { useI18n } from '@/lib/i18n';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SortSelect({ value, onChange }: Props) {
  const { t } = useI18n();

  const options = [
    { value: 'discount', label: t('sort.discount') },
    { value: 'price_asc', label: t('sort.price_asc') },
    { value: 'price_desc', label: t('sort.price_desc') },
    { value: 'rating', label: t('sort.rating') },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-brutal text-sm font-bold uppercase tracking-wide appearance-none cursor-pointer pr-10 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22hsl(0%200%25%2098%25)%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-card">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
