'use client';

import { useState } from 'react';

export interface Filters {
  sort: 'discount' | 'price_asc' | 'price_desc' | 'rating';
  min_price?: number;
  max_price?: number;
  prime_only?: boolean;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3e',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px'
  };

  const mobileButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2a2a3e',
    color: '#e4e4e7',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    alignItems: 'end'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#a1a1aa',
    fontWeight: 'bold',
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase'
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    backgroundColor: '#0f0f1a',
    color: '#e4e4e7',
    border: '1px solid #2a2a3e',
    borderRadius: '4px',
    fontSize: '13px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    backgroundColor: '#0f0f1a',
    color: '#e4e4e7',
    border: '1px solid #2a2a3e',
    borderRadius: '4px',
    fontSize: '13px'
  };

  const toggleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  };

  const checkboxStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  };

  return (
    <>
      {/* Mobile: Collapsible Button */}
      <div style={{ display: 'block' }} className="lg:hidden">
        <button style={mobileButtonStyle} onClick={() => setIsOpen(!isOpen)}>
          <span>Filters</span>
          <span>{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div style={{ ...containerStyle, marginTop: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Sort By</label>
                <select
                  style={selectStyle}
                  value={filters.sort}
                  onChange={(e) => onChange({ ...filters, sort: e.target.value as any })}
                >
                  <option value="discount">Biggest Discount</option>
                  <option value="price_asc">Lowest Price</option>
                  <option value="price_desc">Highest Price</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Min Price (SAR)</label>
                <input
                  type="number"
                  style={inputStyle}
                  placeholder="0"
                  value={filters.min_price || ''}
                  onChange={(e) => onChange({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>

              <div>
                <label style={labelStyle}>Max Price (SAR)</label>
                <input
                  type="number"
                  style={inputStyle}
                  placeholder="10000"
                  value={filters.max_price || ''}
                  onChange={(e) => onChange({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>

              <label style={toggleStyle}>
                <input
                  type="checkbox"
                  style={checkboxStyle}
                  checked={filters.prime_only || false}
                  onChange={(e) => onChange({ ...filters, prime_only: e.target.checked })}
                />
                <span style={{ color: '#e4e4e7', fontSize: '13px' }}>Prime Only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Horizontal Bar */}
      <div style={{ display: 'none' }} className="hidden lg:block">
        <div style={containerStyle}>
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Sort By</label>
              <select
                style={selectStyle}
                value={filters.sort}
                onChange={(e) => onChange({ ...filters, sort: e.target.value as any })}
              >
                <option value="discount">Biggest Discount</option>
                <option value="price_asc">Lowest Price</option>
                <option value="price_desc">Highest Price</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Min Price (SAR)</label>
              <input
                type="number"
                style={inputStyle}
                placeholder="0"
                value={filters.min_price || ''}
                onChange={(e) => onChange({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <div>
              <label style={labelStyle}>Max Price (SAR)</label>
              <input
                type="number"
                style={inputStyle}
                placeholder="10000"
                value={filters.max_price || ''}
                onChange={(e) => onChange({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <label style={toggleStyle}>
              <input
                type="checkbox"
                style={checkboxStyle}
                checked={filters.prime_only || false}
                onChange={(e) => onChange({ ...filters, prime_only: e.target.checked })}
              />
              <span style={{ color: '#e4e4e7', fontSize: '13px' }}>Prime Only</span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
