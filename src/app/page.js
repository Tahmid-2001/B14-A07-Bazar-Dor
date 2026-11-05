'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  toBn,
  formatUnit,
  getProductEmoji,
  getProductName,
  getProductPriceNum,
  getSignedChange,
} from '@/lib/bazar-utils';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const urls = [
        'https://openapi.programming-hero.com/api/bazardor/products',
        'https://api.api-store.workers.dev/api/bazardor/products',
        'https://api.abcz.workers.dev/api/bazardor/products',
      ];
      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            const list = Array.isArray(json) ? json : json.data || json.products || [];
            if (list.length > 0) {
              setProducts(list);
              break;
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
      setLoading(false);
    };

    loadProducts();
  }, []);

  const risers = [...products]
    .filter((p) => getSignedChange(p) > 0)
    .sort((a, b) => getSignedChange(b) - getSignedChange(a))
    .slice(0, 6);

  const fallers = [...products]
    .filter((p) => getSignedChange(p) < 0)
    .sort((a, b) => getSignedChange(a) - getSignedChange(b))
    .slice(0, 6);

  const renderCard = (item) => {
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
              <span className="text-xs font-medium text-stone-600">টাকা</span>
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
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <section className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#e6f4ea] text-[#008236] text-xs font-semibold">
              মঙ্গলবার, ৬ অক্টোবর, ২০২৬
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
              আজকের বাজারের দাম এক নজরে
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-lg">
              চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারভিত্তিক
              বিস্তারিত, গড়, সর্বনিম্ন-সর্বাধিক এবং দামের পরিবর্তন এক জায়গায়।
            </p>
            <div className="pt-2">
              <a
                href="#সব-পণ্য"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#008236] text-white font-semibold text-xs sm:text-sm shadow-sm hover:bg-[#006e2d] transition"
              >
                সব পণ্য দেখুন
              </a>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <img
              src="/bazar-hero.png"
              alt="বাজার দর"
              className="w-56 sm:w-64 h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="space-y-8">
          <div className="h-6 w-44 bg-stone-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-stone-200/70 p-5 h-36 animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-stone-200 rounded" />
                    <div className="h-3 w-16 bg-stone-200 rounded" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 bg-stone-200 rounded" />
                  <div className="h-5 w-14 bg-stone-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="font-bold text-lg sm:text-xl text-stone-900 flex items-center gap-2">
              <span className="text-red-600 text-sm">▲</span>
              <span>আজ দাম বেড়েছে</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {risers.map((item) => renderCard(item))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold text-lg sm:text-xl text-stone-900 flex items-center gap-2">
              <span className="text-emerald-600 text-sm">▼</span>
              <span>আজ দাম কমেছে</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {fallers.map((item) => renderCard(item))}
            </div>
          </section>

          <section id="সব-পণ্য" className="space-y-4 pt-2">
            <div>
              <h2 className="font-bold text-lg sm:text-xl text-stone-900">
                সব পণ্য
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                মোট {toBn(products.length)}টি নিত্যপ্রয়োজনীয় পণ্য
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((item) => renderCard(item))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}