import Link from 'next/link';
import AuthRedirect from './AuthRedirect';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 flex flex-col">
      {/* Redirects logged-in users to /dashboard without blocking server render */}
      <AuthRedirect />

      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative">
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt="Shiloha — 30 Days with God"
          width={120}
          height={120}
          fetchPriority="high"
          className="w-28 h-28 rounded-full object-cover shadow-2xl shadow-black/30 mb-6"
        />

        {/* Title */}
        <h1 className="text-white text-4xl font-extrabold leading-tight">
          ശിലോഹ
        </h1>
        <p className="text-purple-200 text-xl font-semibold mt-1">Shiloha</p>

        {/* Tagline */}
        <p className="text-purple-100 text-lg font-medium mt-4 max-w-xs leading-snug">
          A 30-day spiritual adventure for kids 🌟
        </p>
        <p className="text-purple-300 text-sm mt-2 max-w-xs leading-relaxed">
          Daily Bible readings, activities, games, and prayers to help children
          grow in faith, love, and courage.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['📖 Bible Readings', '🎮 Games', '🙏 Prayers', '🏆 Achievements'].map((f) => (
            <span
              key={f}
              className="bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/login"
            className="w-full bg-white text-purple-700 font-bold text-base py-3.5 rounded-2xl text-center shadow-lg shadow-black/20 active:scale-95 transition-transform"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="w-full bg-white/20 text-white font-bold text-base py-3.5 rounded-2xl text-center border border-white/30 active:scale-95 transition-transform"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 relative">
        <p className="text-purple-300/70 text-xs">
          ✝️ Cherupusha Mission League · Manathavady
        </p>
      </div>
    </div>
  );
}
