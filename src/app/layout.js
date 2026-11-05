'use client';
import './globals.css';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import {
  toBn,
  formatUnit,
  getProductEmoji,
  getProductName,
  getProductPriceNum,
  getSignedChange,
} from '@/lib/bazar-utils';

const DEFAULT_CATEGORIES = [
  { slug: 'chal', name: 'চাল', emoji: '🍚' },
  { slug: 'dal', name: 'ডাল', emoji: '🫘' },
  { slug: 'tel', name: 'তেল', emoji: '🛢️' },
  { slug: 'shobji', name: 'সবজি', emoji: '🥬' },
  { slug: 'mach', name: 'মাছ', emoji: '🐟' },
  { slug: 'mangsho', name: 'মাংস', emoji: '🍗' },
  { slug: 'dim-dudh', name: 'ডিম-দুধ', emoji: '🥛' },
  { slug: 'moshla', name: 'মসলা', emoji: '🌶️' },
];

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchTickerProducts = async () => {
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
          // try next url
        }
      }
    };
    fetchTickerProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setDropdownOpen(false);
    toast.success('সফলভাবে সাইন আউট হয়েছে!');
    router.push('/');
  };

  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col bg-[#f3f5f0] text-stone-900">
        <div data-rht-toaster="">
          <Toaster position="top-center" />
        </div>

        <header className="bg-white border-b border-stone-200/80 sticky top-0 z-50">
          {/* Row 1: Logo & Auth */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#008236] flex items-center justify-center shadow-sm">
                <img
                  src="/logo-icon.png"
                  alt="বাজার দর"
                  className="w-5 h-5 object-contain brightness-0 invert"
                />
              </div>
              <div>
                <span className="font-bold text-lg sm:text-xl text-stone-900 block leading-none">
                  বাজার দর
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">
                  মঙ্গলবার, ৬ অক্টোবর, ২০২৬
                </span>
              </div>
            </Link>

            {/* Right Auth / User Menu */}
            <div className="relative" ref={menuRef}>
              {session?.user ? (
                <div>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl hover:bg-stone-100 transition"
                  >
                    <img
                      src={
                        session.user.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          session.user.name || 'User'
                        )}&background=008236&color=fff`
                      }
                      alt={session.user.name}
                      className="w-8 h-8 rounded-full object-cover border border-stone-200"
                    />
                    <span className="text-sm font-semibold text-stone-800">
                      {session.user.name?.split(' ')[0]}
                    </span>
                    <span className="text-xs text-stone-400">▾</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-lg border border-stone-200/90 py-3 px-4 z-50">
                      <div className="pb-2.5 mb-2 border-b border-stone-100">
                        <p className="font-bold text-sm text-stone-900">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-stone-500 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 py-2 text-xs sm:text-sm font-medium text-stone-700 hover:text-[#008236] transition"
                      >
                        <span>👤</span>
                        <span>আমার প্রোফাইল</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 transition text-left"
                      >
                        <span>↪</span>
                        <span>সাইন আউট</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 sm:gap-4">
                  <Link
                    href="/signin"
                    className="text-xs sm:text-sm font-semibold text-stone-700 hover:text-[#008236] transition px-2 py-1.5"
                  >
                    সাইন ইন
                  </Link>
                  <Link
                    href="/signup"
                    className="text-xs sm:text-sm font-semibold bg-[#008236] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-[#006e2d] transition"
                  >
                    সাইন আপ
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Category Navigation Bar */}
          <div className="border-t border-stone-100 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-start sm:justify-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
              {DEFAULT_CATEGORIES.map((cat) => {
                const isActive = pathname === `/category/${cat.slug}`;
                return (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                      isActive
                        ? 'bg-[#008236] text-white shadow-xs'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Row 3: Price Ticker Marquee */}
          {products.length > 0 && (
            <div className="border-t border-stone-200/80 bg-[#fafbf9] overflow-hidden py-1.5">
              <div className="animate-marquee flex items-center">
                {[...products, ...products].map((item, idx) => {
                  const signed = getSignedChange(item);
                  const pctStr = toBn(Math.abs(signed).toFixed(1)) + '%';
                  const priceDisplay = toBn(getProductPriceNum(item));
                  const itemName = getProductName(item);
                  const shortUnit = formatUnit(item.unit, false);

                  return (
                    <Link
                      key={`${item.id || item.slug || idx}-${idx}`}
                      href={`/product/${item.slug || item.id}`}
                      className="flex items-center gap-1.5 px-5 border-r border-stone-200 text-xs whitespace-nowrap hover:opacity-80"
                    >
                      <span>{getProductEmoji(item)}</span>
                      <span className="font-semibold text-stone-800">
                        {itemName}
                      </span>
                      <span className="text-stone-500">
                        {priceDisplay} টাকা/{shortUnit}
                      </span>
                      {signed > 0 ? (
                        <span className="text-red-600 font-semibold">
                          ▲ {pctStr}
                        </span>
                      ) : signed < 0 ? (
                        <span className="text-emerald-600 font-semibold">
                          ▼ {pctStr}
                        </span>
                      ) : (
                        <span className="text-stone-400 font-medium">
                          — ০.০%
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </header>

        <main className="flex-grow">{children}</main>

        <footer className="bg-white border-t border-stone-200/80 py-6 mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <p className="font-medium text-stone-600">
              বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
            </p>
            <p>সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।</p>
          </div>
        </footer>
      </body>
    </html>
  );
}