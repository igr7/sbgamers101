import { CategorySearch } from './types';

// Search terms for each category on amazon.sa
export const CATEGORY_SEARCHES: CategorySearch[] = [
  {
    slug: 'cpu',
    categoryId: 1,
    searchTerms: ['gaming processor CPU', 'Intel Core processor', 'AMD Ryzen processor'],
  },
  {
    slug: 'gpu',
    categoryId: 2,
    searchTerms: ['graphics card GPU', 'NVIDIA GeForce RTX', 'AMD Radeon RX'],
  },
  {
    slug: 'ram',
    categoryId: 3,
    searchTerms: ['gaming RAM DDR5', 'desktop memory DDR4 DDR5', 'Corsair Kingston RAM'],
  },
  {
    slug: 'motherboard',
    categoryId: 4,
    searchTerms: ['gaming motherboard', 'ASUS ROG motherboard', 'MSI motherboard'],
  },
  {
    slug: 'psu',
    categoryId: 5,
    searchTerms: ['power supply unit gaming', 'modular PSU 80 plus', 'Corsair EVGA power supply'],
  },
  {
    slug: 'case',
    categoryId: 6,
    searchTerms: ['gaming PC case', 'ATX computer case RGB', 'NZXT Corsair case'],
  },
  {
    slug: 'cooling',
    categoryId: 7,
    searchTerms: ['CPU cooler gaming', 'AIO liquid cooler', 'Noctua cooler master'],
  },
  {
    slug: 'mouse',
    categoryId: 8,
    searchTerms: ['gaming mouse', 'wireless gaming mouse', 'Logitech Razer mouse'],
  },
  {
    slug: 'keyboard',
    categoryId: 9,
    searchTerms: ['mechanical gaming keyboard', 'RGB gaming keyboard', 'Razer Corsair keyboard'],
  },
  {
    slug: 'headset',
    categoryId: 10,
    searchTerms: ['gaming headset', 'wireless gaming headset', 'HyperX SteelSeries headset'],
  },
  {
    slug: 'monitor',
    categoryId: 11,
    searchTerms: ['gaming monitor 144Hz', 'gaming monitor 4K', '27 inch gaming monitor'],
  },
  {
    slug: 'chair',
    categoryId: 12,
    searchTerms: ['gaming chair', 'ergonomic gaming chair', 'Secretlab DXRacer chair'],
  },
];
