'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  toBn,
  formatUnit,
  getProductEmoji,
  getProductName,
  getProductPriceNum,
  getSignedChange,
  matchesCategorySlug,
} from '@/lib/bazar-utils';

const CATEGORY_MAP = {
  chal: { name: 'চাল', emoji: '🍚' },
  dal: { name: 'ডাল', emoji: '🫘' },
  tel: { name: 'তেল', emoji: '🛢️' },
  shobji: { name: 'সবজি', emoji: '🥬' },
  mach: { name: 'মাছ', emoji: '🐟' },
  mangsho: { name: 'মাংস', emoji: '🍗' },
  'dim-dudh': { name: 'ডিম-দুধ', emoji: '🥛' },
  moshla: { name: 'মসলা', emoji: '🌶️' },
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug;

  const [products, setProducts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      const baseUrls = [
        'https://openapi.programming-hero.com/api/bazardor',
        'https://api.api-store.workers.dev/api/bazardor',
        'https://api.abcz.workers.dev/api/bazardor',
      ];

      let allProducts = [];
      for (const base of baseUrls) {
        try {
          const res = await fetch(`${base}/products`);
          if (res.ok) {
            const json = await res.json();
            const list = Array.isArray(json) ? json : json.data || json.products || [];
            if (list.length > 0) {
              allProducts = list;
              break;
            }
          }
        } catch (err) {
          // try next url
        }
      }

      const filtered = allProducts.filter((item) => matchesCategorySlug(item, slug));

      setProducts(filtered);
      setCategoryInfo(CATEGORY_MAP[slug] || null);
      setLoading(false);
    };

    if (slug) fetchCategoryData();
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'low-to-high') return getProductPriceNum(a) - getProductPriceNum(b);
    if (sortBy === 'high-to-low') return getProductPriceNum(b) - getProductPriceNum(a);
    return 0;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 h-24 animate-pulse" />
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 h-14 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 h-36 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!categoryInfo || products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-10 max-w-md mx-auto space-y-4">
          <div className="text-5xl">🔍</div>
          <h1 className="text-2xl font-bold text-stone-900">
            কোনো পণ্য পাওয়া যায়নি
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            আপনি যে ক্যাটাগরি খুঁজছেন তা পাওয়া যায়নি অথবা এতে কোনো পণ্য নেই।
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#008236] text-white font-semibold text-xs sm:text-sm hover:bg-[#006e2d] transition"
            >
              হোম পেজে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#f4f6f2] flex items-center justify-center text-3xl">
          {categoryInfo.emoji}
        </div>
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-stone-900">
            {categoryInfo.name}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {toBn(products.length)}টি পণ্যের আজকের দাম ও পরিবর্তন
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 px-5 py-3.5 flex items-center justify-end gap-2.5">
        <span className="text-xs text-stone-500 font-medium">সাজান</span>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-white border border-stone-200 rounded-lg px-3.5 py-1.5 pr-8 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#008236] cursor-pointer"
          >
            <option value="default">ডিফল্ট</option>
            <option value="low-to-high">দাম: কম থেকে বেশি</option>
            <option value="high-to-low">দাম: বেশি থেকে কম</option>
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none">
            ▼
          </span>
        </div>
      </div>

      <p className="text-xs text-stone-500">
        মোট {toBn(sortedProducts.length)}টি পণ্য দেখানো হচ্ছে
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedProducts.map((item) => {
          const signed = getSignedChange(item);
          const absChange = toBn(Math.abs(signed).toFixed(1));
          const priceText = toBn(getProductPriceNum(item));
          const unitText = formatUnit(item.unit, true);
          const itemName = getProductName(item);

          return (
            <Link
              key={item.id || item.slug}
              href={`/product/${item.slug || item.id}`}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 flex flex-col justify-between hover:shadow-md hover:border-stone-300 transition"
            >
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#f4f6f2] flex items-center justify-center text-2xl shrink-0">
                  {getProductEmoji(item)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900 leading-snug">
                    {itemName}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{unitText}</p>
                </div>
              </div>

              <div className="flex items-end justify-between pt-1">
                <div>
                  <span className="text-[11px] text-stone-500 block">আজকের দাম</span>
                  <span className="font-bold text-xl text-stone-900">
                    {priceText}{' '}
                    <span className="text-xs font-medium text-stone-600">
                      টাকা
                    </span>
                  </span>
                </div>

                {signed > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-600">
                    ▲ {absChange}%
                  </span>
                ) : signed < 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600">
                    ▼ {absChange}%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-500">
                    — ০.০%
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}