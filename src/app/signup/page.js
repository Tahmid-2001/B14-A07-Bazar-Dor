'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে!');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('পাসওয়ার্ড দুটি মিলছে না!');
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({ name, email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে!');
      return;
    }

    toast.success('অ্যাকাউন্ট তৈরি হয়েছে! এখন সাইন ইন করুন।');
    router.push('/signin');
  };

  const handleSocialLogin = async (provider) => {
    const { error } = await authClient.signIn.social({ provider });
    if (error) {
      toast.error('সোশ্যাল লগইন ব্যর্থ হয়েছে!');
      return;
    }
    toast.success(`${provider === 'google' ? 'Google' : 'GitHub'} দিয়ে সফলভাবে লগইন হয়েছে!`);
    router.push('/');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center">
      <div className="text-center mb-6">
        <h1 className="font-bold text-2xl sm:text-3xl text-stone-900">
          অ্যাকাউন্ট তৈরি করুন
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          বিনা খরচে সাইন আপ করে সব বিস্তারিত দাম দেখুন।
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 w-full max-w-md shadow-xs">
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              নাম
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: রহিম উদ্দিন"
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              ইমেইল
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="কমপক্ষে ৮ অক্ষর"
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              পাসওয়ার্ড নিশ্চিত করুন
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="আবার লিখুন"
              className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#008236]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#008236] text-white font-semibold text-sm hover:bg-[#006e2d] transition shadow-xs"
          >
            {loading ? 'অপেক্ষা করুন...' : 'অ্যাকাউন্ট তৈরি করুন'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-stone-200 flex-1" />
          <span className="text-xs text-stone-400">অথবা</span>
          <div className="h-px bg-stone-200 flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
          >
            <span className="text-red-500 font-bold">G</span>
            <span>Google দিয়ে চালিয়ে যান</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('github')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
          >
            <span>🐙</span>
            <span>GitHub দিয়ে চালিয়ে যান</span>
          </button>
        </div>

        <p className="text-center text-xs text-stone-500 mt-6">
          অ্যাকাউন্ট আছে?{' '}
          <Link href="/signin" className="text-[#008236] font-semibold hover:underline">
            সাইন ইন করুন
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 text-xs text-stone-500 hover:text-stone-800 transition"
      >
        ← হোম পেজে ফিরে যান
      </Link>
    </div>
  );
}