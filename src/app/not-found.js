import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
      <div className="bg-white rounded-3xl border border-stone-200/80 p-10 max-w-md mx-auto space-y-4">
        <h2 className="text-5xl font-extrabold text-[#008236]">৪০৪</h2>
        <h3 className="text-xl font-bold text-stone-900">
          পেজটি খুঁজে পাওয়া যায়নি
        </h3>
        <p className="text-xs sm:text-sm text-stone-500">
          আপনি যে পেজটি খুঁজছেন তা বিদ্যমান নেই অথবা সরিয়ে ফেলা হয়েছে।
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-6 py-2.5 rounded-xl bg-[#008236] text-white font-semibold text-xs sm:text-sm hover:bg-[#006e2d] transition"
          >
            হোম পেজে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}