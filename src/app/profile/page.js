'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState('');

  useEffect(() => {
    if (!isPending && !session?.user) {
      toast.error('প্রোফাইল দেখতে সাইন ইন করুন!');
      router.push('/signin');
    } else if (session?.user) {
      setName(session.user.name || '');
    }
  }, [isPending, session, router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await authClient.updateUser({ name });
    if (error) {
      toast.error(error.message || 'আপডেট ব্যর্থ হয়েছে!');
      return;
    }
    toast.success('নাম সফলভাবে আপডেট হয়েছে!');
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    toast.success('সফলভাবে সাইন আউট হয়েছে!');
    router.push('/');
  };

  if (isPending || !session?.user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-4">
        <div className="h-8 w-40 bg-stone-200 rounded animate-pulse" />
        <div className="h-28 bg-white rounded-2xl border border-stone-200/80 animate-pulse" />
        <div className="h-44 bg-white rounded-2xl border border-stone-200/80 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl text-stone-900">
          আমার প্রোফাইল
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।
        </p>
      </div>

      {/* Top User Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              session.user.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                session.user.name
              )}&background=008236&color=fff`
            }
            alt={session.user.name}
            className="w-14 h-14 rounded-xl object-cover border border-stone-200"
          />
          <div>
            <h2 className="font-bold text-base sm:text-lg text-stone-900">
              {session.user.name}
            </h2>
            <p className="text-xs text-stone-500">{session.user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/profile/update"
            className="px-3.5 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
          >
            Update Info
          </Link>
          <button
            onClick={handleSignOut}
            className="px-3.5 py-2 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            ↪ সাইন আউট
          </button>
        </div>
      </div>

      {/* Update Form Card (Matches Figma Profile Screenshot) */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-sm sm:text-base text-stone-900">তথ্য</h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              নাম
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#008236]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#008236] text-white font-semibold text-xs sm:text-sm hover:bg-[#006e2d] transition shadow-xs"
          >
            আপডেট
          </button>
        </form>
      </div>
    </div>
  );
}