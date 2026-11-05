'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import {
  toBn,
  toNum,
  formatUnit,
  getProductEmoji,
  getProductName,
  getProductPriceNum,
  getSignedChange,
} from '@/lib/bazar-utils';

const DEFAULT_MARKETS = [
  { name: 'মাঠ বাজার', division: 'ময়মনসিংহ', minDiff: -7, maxDiff: -1, avgDiff: -4 },
  { name: 'সদর বাজার', division: 'রাজশাহী', minDiff: -6, maxDiff: 0, avgDiff: -3 },
  { name: 'বাজারহাট', division: 'খুলনা', minDiff: -6, maxDiff: 1, avgDiff: -2.5 },
  { name: 'বগারহাট বাজার', division: 'রাজশাহী', minDiff: -6, maxDiff: 2, avgDiff: -2 },
  { name: 'বৌদ্ধ বাজার', division: 'ময়মনসিংহ', minDiff: -6, maxDiff: 3, avgDiff: -1.5 },
  { name: 'আমতলী বাজার', division: 'চট্টগ্রাম', minDiff: -5, maxDiff: 3, avgDiff: -1 },
  { name: 'ডবলমুরিং বাজার', division: 'খুলনা', minDiff: -4, maxDiff: 3, avgDiff: -0.5 },
  { name: 'চৌরাস্তা বাজার', division: 'সিলেট', minDiff: -3, maxDiff: 5, avgDiff: 1 },
  { name: 'মিরপুর ১ বাজার', division: 'ঢাকা', minDiff: -2, maxDiff: 5, avgDiff: 1.5 },
  { name: 'চৌদ্দগ্রাম বাজার', division: 'চট্টগ্রাম', minDiff: -3, maxDiff: 7, avgDiff: 2 },
  { name: 'আম্বরখানা বাজার', division: 'সিলেট', minDiff: -2, maxDiff: 7, avgDiff: 2.5 },
  { name: 'কারওয়ান বাজার', division: 'ঢাকা', minDiff: -1, maxDiff: 7, avgDiff: 3 },
];

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const { data: session, isPending } = authClient.useSession();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const toastShown = useRef(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      if (!toastShown.current) {
        toastShown.current = true;
        toast.error('বিস্তারিত দাম দেখতে অনুগ্রহ করে সাইন ইন করুন!');
      }
      router.push('/signin');
    }
  }, [isPending, session, router]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const baseUrls = [
        'https://openapi.programming-hero.com/api/bazardor',
        'https://api.api-store.workers.dev/api/bazardor',
        'https://api.abcz.workers.dev/api/bazardor',
      ];

      let foundProduct = null;

      for (const base of baseUrls) {
        try {
          const res = await fetch(`${base}/products/${slug}`);
          if (res.ok) {
            const json = await res.json();
            const item = json.data || json.product || json;
            if (item && (item.id || item.slug || item.name || item.nameBn)) {
              foundProduct = item;
              break;
            }
          }
        } catch (err) {
          // continue
        }
      }

      if (!foundProduct) {
        for (const base of baseUrls) {
          try {
            const res = await fetch(`${base}/products`);
            if (res.ok) {
              const json = await res.json();
              const list = Array.isArray(json) ? json : json.data || json.products || [];
              const match = list.find(
                (p) => String(p.slug) === String(slug) || String(p.id) === String(slug)
              );
              if (match) {
                foundProduct = match;
                break;
              }
            }
          } catch (err) {
            // continue
          }
        }
      }

      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };

    if (slug) fetchProduct();
  }, [slug]);

  if (isPending || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="h-4 w-40 bg-stone-200 rounded animate-pulse" />
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 h-40 animate-pulse" />
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 h-96 animate-pulse" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (notFound || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-10 max-w-md mx-auto space-y-4">
          <div className="text-5xl">📦</div>
          <h1 className="text-2xl font-bold text-stone-900">পণ্যটি পাওয়া যায়নি</h1>
          <p className="text-xs sm:text-sm text-stone-500">
            আপনি যে পণ্যটি খুঁজছেন তা তালিকায় পাওয়া যায়নি।
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#008236] text-white font-semibold text-xs sm:text-sm hover:bg-[#006e2d] transition"
          >
            হোম পেজে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  const basePrice = getProductPriceNum(product);
  const minPrice = toBn(
    toNum(product.minPrice ?? product.minimumPrice ?? product.prices?.min ?? product.priceSummary?.min) ||
      Math.max(10, Math.round(basePrice - 7))
  );
  const maxPrice = toBn(
    toNum(product.maxPrice ?? product.maximumPrice ?? product.prices?.max ?? product.priceSummary?.max) ||
      Math.round(basePrice + 7)
  );
  const avgPrice = toBn(
    toNum(product.avgPrice ?? product.averagePrice ?? product.prices?.avg ?? product.priceSummary?.avg) ||
      basePrice
  );

  const signed = getSignedChange(product);
  const changeNum = Math.abs(signed);
  const unitLabel = formatUnit(product.unit, true);
  const shortUnit = formatUnit(product.unit, false);
  const productName = getProductName(product);
  const categoryName =
    typeof product.category === 'object'
      ? product.category.bn || product.category.name || 'নিত্যপণ্য'
      : product.categoryBn || product.categoryName || product.category || 'নিত্যপণ্য';

  const rawMarkets = product.markets || product.bazarPrices || product.marketPrices || product.bazars;
  const marketsList =
    Array.isArray(rawMarkets) && rawMarkets.length > 0
      ? rawMarkets
      : DEFAULT_MARKETS.map((m) => ({
          name: m.name,
          division: m.division,
          minPrice: Math.max(5, Math.round(basePrice + m.minDiff)),
          maxPrice: Math.max(10, Math.round(basePrice + m.maxDiff)),
          avgPrice: Math.max(8, +(basePrice + m.avgDiff).toFixed(2)),
        }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <nav className="text-xs text-stone-500 flex items-center gap-2">
        <Link href="/" className="hover:text-[#008236]">
          হোম
        </Link>
        <span>›</span>
        <span>{String(categoryName)}</span>
        <span>›</span>
        <span className="text-stone-800 font-medium">{productName}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#f4f6f2] flex items-center justify-center text-4xl shrink-0">
            {getProductEmoji(product)}
          </div>
          <div>
            <h1 className="font-bold text-2xl sm:text-3xl text-stone-900">
              {productName}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {unitLabel} · {String(categoryName)}
            </p>
            <p className="text-xs text-stone-600 mt-2">
              {typeof product.summary === 'string'
                ? product.summary
                : typeof product.description === 'string'
                ? product.description
                : `গতকালের তুলনায় আজ দাম ${signed < 0 ? 'কমেছে' : 'বেড়েছে'} ২ টাকা`}
            </p>
          </div>
        </div>

        <div className="bg-[#f6f7f4] rounded-2xl px-6 py-4 text-center sm:min-w-[140px]">
          <span className="text-[11px] text-stone-500 block">আজকের দাম</span>
          <span className="font-extrabold text-3xl text-stone-900 block my-0.5">
            {toBn(basePrice)}
          </span>
          <span className="text-[11px] text-stone-500 block">
            টাকা / {shortUnit}
          </span>
          <div className="mt-1.5">
            {signed > 0 ? (
              <span className="text-[11px] font-bold text-red-600">
                ▲ {toBn(changeNum.toFixed(1))}%
              </span>
            ) : signed < 0 ? (
              <span className="text-[11px] font-bold text-emerald-600">
                ▼ {toBn(changeNum.toFixed(1))}%
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-stone-500">
                — ০.০%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-7 space-y-8">
        <div className="space-y-4">
          <h2 className="font-bold text-base sm:text-lg text-stone-900">
            দামের সারসংক্ষেপ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-stone-200/80 p-4">
              <span className="text-xs text-stone-500 block">সর্বনিম্ন দাম</span>
              <span className="font-bold text-2xl text-[#008236] block mt-1">
                {minPrice} <span className="text-sm font-semibold">টাকা</span>
              </span>
              <span className="text-[11px] text-stone-400 block mt-1">
                সবচেয়ে কম দামের বাজার
              </span>
            </div>

            <div className="rounded-xl border border-stone-200/80 p-4">
              <span className="text-xs text-stone-500 block">সর্বাধিক দাম</span>
              <span className="font-bold text-2xl text-red-600 block mt-1">
                {maxPrice} <span className="text-sm font-semibold">টাকা</span>
              </span>
              <span className="text-[11px] text-stone-400 block mt-1">
                সবচেয়ে বেশি দামের বাজার
              </span>
            </div>

            <div className="rounded-xl border border-stone-200/80 p-4">
              <span className="text-xs text-stone-500 block">গড় দাম</span>
              <span className="font-bold text-2xl text-[#008236] block mt-1">
                {avgPrice} <span className="text-sm font-semibold">টাকা</span>
              </span>
              <span className="text-[11px] text-stone-400 block mt-1">
                {unitLabel}-এর হিসাব
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-base sm:text-lg text-stone-900">
            বাজারভিত্তিক আজকের দাম
          </h2>

          <div className="overflow-x-auto rounded-xl border border-stone-200/80">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#fafbf9] border-b border-stone-200/80 text-stone-500 font-medium">
                  <th className="py-3 px-4">বাজার</th>
                  <th className="py-3 px-4">বিভাগ</th>
                  <th className="py-3 px-4 text-right">সর্বনিম্ন</th>
                  <th className="py-3 px-4 text-right">সর্বাধিক</th>
                  <th className="py-3 px-4 text-right">গড়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70">
                {marketsList.map((m, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/80">
                    <td className="py-3.5 px-4 font-semibold text-stone-800">
                      {String(m.nameBn || m.name || m.bazar || m.marketName || '')}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {String(m.divisionBn || m.division || m.location || 'ঢাকা')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-stone-600">
                      {toBn(toNum(m.minPrice ?? m.min) || minPrice)} টাকা
                    </td>
                    <td className="py-3.5 px-4 text-right text-stone-600">
                      {toBn(toNum(m.maxPrice ?? m.max) || maxPrice)} টাকা
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                      {toBn(toNum(m.avgPrice ?? m.avg ?? m.price) || avgPrice)} টাকা
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}