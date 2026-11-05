'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

export default function UpdateProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState('');

  useEffect(() => {
    if (!isPending && !session?.user) {
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
    toast.success('তথ্য সফলভাবে আপডেট হয়েছে!');
    router.push('/profile');
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-14 space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 space-y-5">
        <div>
          <h1 className="font-bold text-xl text-stone-900">তথ্য আপডেট করুন</h1>
          <p className="text-xs text-stone-500 mt-1">
            আপনার প্রোফাইলের নাম পরিবর্তন করুন।
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              নাম (Name)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম লিখুন"
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#008236]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#008236] text-white font-semibold text-sm hover:bg-[#006e2d] transition"
          >
            Update Information
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/profile"
            className="text-xs text-stone-500 hover:text-stone-800"
          >
            ← প্রোফাইলে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}