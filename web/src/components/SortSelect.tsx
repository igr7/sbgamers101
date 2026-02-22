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
      className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-300
                 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer
                 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22%23666%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')]
                 bg-no-repeat bg-[right_12px_center] pe-10"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#12121a]">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
