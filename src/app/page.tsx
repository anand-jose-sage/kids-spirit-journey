import Link from 'next/link';
import AuthRedirect from './AuthRedirect';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <AuthRedirect />

      {/* Decorative blobs */}
      <div
        className="aurora-blob pointer-events-none absolute"
        style={{
          width: 340, height: 340, borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(0.78 0.14 295 / 0.55) 0%, transparent 70%)',
          top: -80, right: -80, zIndex: 0,
        }}
      />
      <div
        className="aurora-blob pointer-events-none absolute"
        style={{
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(0.82 0.12 340 / 0.45) 0%, transparent 70%)',
          bottom: 40, left: -60, zIndex: 0,
          animationDelay: '3s',
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">

        {/* Logo */}
        <div
          className="sg-pill"
          style={{ padding: 5, marginBottom: 20, display: 'inline-block' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="Shiloha — 30 Days with God"
            width={96}
            height={96}
            fetchPriority="high"
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Title */}
        <h1
          className="font-display"
          style={{ fontSize: 42, fontWeight: 800, color: 'oklch(0.20 0.10 275)', lineHeight: 1.1, marginBottom: 4 }}
        >
          ശിലോഹ
        </h1>
        <p
          className="font-cinzel"
          style={{ fontSize: 14, letterSpacing: '0.22em', color: 'oklch(0.42 0.18 280)', fontWeight: 600, marginBottom: 16 }}
        >
          SHILOHA
        </p>

        {/* Tagline */}
        <p
          className="font-anek"
          style={{ fontSize: 16, color: 'oklch(0.32 0.08 270)', maxWidth: 280, lineHeight: 1.65, marginBottom: 6 }}
        >
          A 30-day spiritual journey with Jesus🌟
        </p>
        <p
          className="font-anek"
          style={{ fontSize: 13, color: 'oklch(0.50 0.06 270)', maxWidth: 300, lineHeight: 1.7, marginBottom: 24 }}
        >
          Daily Bible readings, Marian studies, games, and prayers to help children
          grow in faith, love, and courage.
        </p>
        <p>Conceptulize</p>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
          {['📖 Bible', '🎮 Games', '🙏 Prayers', '🏆 Achievements'].map((f) => (
            <span
              key={f}
              className="sg-pill convex font-anek"
              style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, color: 'oklch(0.38 0.14 270)', position: 'relative' }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
          <Link
            href="/login"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '15px 24px', borderRadius: 99,
              background: 'linear-gradient(135deg, oklch(0.52 0.22 280), oklch(0.56 0.18 215))',
              boxShadow: '0 4px 24px oklch(0.52 0.22 280 / 0.38), 0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.30)',
              color: 'white', fontWeight: 700, fontSize: 15,
              fontFamily: 'var(--font-cinzel), serif',
              letterSpacing: '0.06em', textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="sg-pill convex"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '15px 24px',
              color: 'oklch(0.38 0.18 280)', fontWeight: 700, fontSize: 15,
              fontFamily: 'var(--font-cinzel), serif',
              letterSpacing: '0.06em', textDecoration: 'none',
              position: 'relative',
            }}
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 relative z-10">
        <p
          className="font-cinzel"
          style={{ fontSize: 10, color: 'oklch(0.58 0.06 270)', letterSpacing: '0.14em' }}
        >
          ✝ Cherupusha Mission League · Manathavady
        </p>
      </div>
    </div>
  );
}
