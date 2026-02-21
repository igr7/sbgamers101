'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type Lang = 'en' | 'ar';

const translations: Record<string, Record<Lang, string>> = {
  'site.name': { en: 'SB Gamers', ar: 'SB Gamers' },
  'site.tagline': { en: 'Compare Gaming Prices in Saudi Arabia', ar: 'قارن أسعار الألعاب في السعودية' },
  'site.subtitle': { en: 'Track prices, verify discounts, and find the best deals on Amazon.sa', ar: 'تتبع الأسعار، تحقق من الخصومات، واعثر على أفضل العروض على أمازون' },
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.deals': { en: 'Deals', ar: 'العروض' },
  'nav.categories': { en: 'Categories', ar: 'الأقسام' },
  'nav.search': { en: 'Search products...', ar: 'ابحث عن المنتجات...' },
  'product.price': { en: 'Price', ar: 'السعر' },
  'product.was': { en: 'Was', ar: 'كان' },
  'product.off': { en: 'OFF', ar: 'خصم' },
  'product.viewDeal': { en: 'View on Amazon.sa', ar: 'شاهد على أمازون' },
  'product.priceHistory': { en: 'Price History', ar: 'تاريخ السعر' },
  'product.isThisDealReal': { en: 'Is this deal real?', ar: 'هل هذا العرض حقيقي؟' },
  'product.realDeal': { en: 'Genuine discount — the price was consistently higher before this drop.', ar: 'خصم حقيقي — السعر كان أعلى بشكل مستمر قبل هذا الانخفاض.' },
  'product.fakeDeal': { en: 'Suspicious — the price has been at or near this level before. The "discount" may be inflated.', ar: 'مشبوه — السعر كان عند هذا المستوى أو قريباً منه سابقاً. قد يكون "الخصم" مبالغاً فيه.' },
  'product.notEnoughData': { en: 'Not enough history yet — we need more data points to verify this deal.', ar: 'لا توجد بيانات كافية بعد — نحتاج المزيد من البيانات للتحقق.' },
  'product.specifications': { en: 'Details', ar: 'التفاصيل' },
  'product.reviews': { en: 'reviews', ar: 'تقييم' },
  'deals.title': { en: 'Today\'s Best Deals', ar: 'أفضل عروض اليوم' },
  'deals.subtitle': { en: 'The biggest verified discounts on gaming gear right now', ar: 'أكبر الخصومات المُتحقق منها على معدات الألعاب الآن' },
  'sort.discount': { en: 'Biggest Discount', ar: 'أكبر خصم' },
  'sort.price_asc': { en: 'Price: Low to High', ar: 'السعر: من الأقل للأعلى' },
  'sort.price_desc': { en: 'Price: High to Low', ar: 'السعر: من الأعلى للأقل' },
  'sort.rating': { en: 'Top Rated', ar: 'الأعلى تقييماً' },
  'common.sar': { en: 'SAR', ar: 'ر.س' },
  'common.loading': { en: 'Loading...', ar: 'جاري التحميل...' },
  'common.noResults': { en: 'No products found', ar: 'لا توجد منتجات' },
  'common.seeAll': { en: 'View All', ar: 'عرض الكل' },
  'common.products': { en: 'Products', ar: 'منتجات' },
  'common.prev': { en: 'Previous', ar: 'السابق' },
  'common.next': { en: 'Next', ar: 'التالي' },
  'common.page': { en: 'Page', ar: 'صفحة' },
  'common.of': { en: 'of', ar: 'من' },
  'footer.disclaimer': { en: 'Prices are sourced from Amazon.sa and updated daily. SB Gamers does not sell products — we help you find the best prices.', ar: 'الأسعار مصدرها أمازون وتُحدّث يومياً. SB Gamers لا يبيع المنتجات — نساعدك في العثور على أفضل الأسعار.' },
  'footer.about': { en: 'About', ar: 'عن الموقع' },
  'footer.aboutText': { en: 'SB Gamers is a free price comparison tool for gaming products in Saudi Arabia. We track prices daily so you can spot real deals.', ar: 'SB Gamers أداة مجانية لمقارنة أسعار منتجات الألعاب في السعودية. نتتبع الأسعار يومياً لتتمكن من اكتشاف العروض الحقيقية.' },
  'hero.trending': { en: 'Trending Now', ar: 'الرائج الآن' },
  'hero.cta': { en: 'Browse Deals', ar: 'تصفح العروض' },
  'hero.cta2': { en: 'All Categories', ar: 'جميع الأقسام' },
  'category.showAll': { en: 'Browse All Categories', ar: 'تصفح جميع الأقسام' },
  'price.lowest': { en: 'Lowest', ar: 'الأقل' },
  'price.current': { en: 'Current', ar: 'الحالي' },
  'price.highest': { en: 'Highest', ar: 'الأعلى' },
  'price.average': { en: 'Average', ar: 'المتوسط' },
  'filter.minDiscount': { en: 'Min. Discount', ar: 'أقل خصم' },
};

export function useI18n() {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('sbg-lang') as Lang | null;
    if (saved) {
      setLangState(saved);
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = saved;
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('sbg-lang', l);
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string): string => translations[key]?.[lang] ?? key,
    [lang]
  );

  return { lang, setLang, t, isRtl: lang === 'ar' };
}
