'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { lang, setLang } = useLang();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  async function handleLogin(e: { preventDefault(): void }) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const syntheticEmail = `${phone}@kidsjourney.app`;
      const { error } = await supabase.auth.signInWithPassword({ email: syntheticEmail, password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('invalid credentials')) {
          setError('Wrong mobile number or password. Try again!');
        } else if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
          setError('Too many attempts. Please wait a moment and try again.');
        } else {
          setError('Something went wrong. Please try again.');
        }
        return;
      }
      router.replace('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      {/* Decorative blobs */}
      <div
        className="aurora-blob pointer-events-none absolute"
        style={{
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(0.78 0.14 295 / 0.50) 0%, transparent 70%)',
          top: -60, right: -80, zIndex: 0,
        }}
      />
      <div
        className="aurora-blob pointer-events-none absolute"
        style={{
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(0.84 0.10 200 / 0.45) 0%, transparent 70%)',
          bottom: 60, left: -60, zIndex: 0, animationDelay: '4s',
        }}
      />

      {/* Header */}
      <div className="flex flex-col items-center pt-safe pt-10 pb-6 px-6 relative z-10">
        {/* Logo */}
        <div className="sg-pill" style={{ padding: 5, marginBottom: 14, display: 'inline-block' }}>
          <img
            src="/images/logo.png"
            alt="Logo"
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Title */}
        <h1
          className="font-display"
          style={{ fontSize: 32, fontWeight: 800, color: 'oklch(0.20 0.10 275)', lineHeight: 1.1 }}
        >
          ശിലോഹ{' '}
          <span style={{ fontSize: 20, fontWeight: 600, color: 'oklch(0.42 0.14 280)' }}>| Shiloha</span>
        </h1>

        {/* Org banner */}
        <div
          style={{
            marginTop: 10,
            padding: '7px 20px',
            borderRadius: 99,
            background: 'linear-gradient(90deg, oklch(0.75 0.18 55), oklch(0.62 0.22 20), oklch(0.75 0.18 55))',
            boxShadow: '0 2px 12px oklch(0.62 0.22 20 / 0.35)',
            textAlign: 'center',
          }}
        >
          <p
            className="font-display"
            style={{ color: 'white', fontWeight: 700, fontSize: 14, lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
          >
            ചെറുപുഷ്‌പ മിഷൻ ലീഗ്
          </p>
          <p
            className="font-anek"
            style={{ color: 'oklch(0.95 0.06 55)', fontSize: 12, textShadow: '0 1px 4px rgba(0,0,0,0.45)' }}
          >
            മാനന്തവാടി രൂപത
          </p>
        </div>

        <p
          className="font-anek"
          style={{ color: 'oklch(0.48 0.08 270)', fontSize: 13, marginTop: 8 }}
        >
          Through Mary, to Jesus
        </p>
      </div>

      {/* Glass form card */}
      <div className="flex-1 px-4 pb-10 relative z-10">
        <div className="sg-panel prism sg-noise" style={{ padding: '24px 20px' }}>

          {/* Welcome + Lang toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2
              className="font-display"
              style={{ fontSize: 22, fontWeight: 700, color: 'oklch(0.20 0.08 270)' }}
            >
              Welcome 👋
            </h2>
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'ml' : 'en')}
              className="sg-pill convex font-cinzel"
              style={{ padding: '5px 13px', fontSize: 11, fontWeight: 700, color: 'oklch(0.42 0.18 280)', position: 'relative', border: 'none', cursor: 'pointer' }}
            >
              {lang === 'en' ? 'മലയാളം' : 'EN'}
            </button>
          </div>

          {/* Create account CTA */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <p
              className="font-anek"
              style={{ fontSize: 13, color: 'oklch(0.42 0.14 280)', fontWeight: 600, marginBottom: 10 }}
            >
              {lang === 'en' ? 'New member here?' : 'പുതിയ അംഗമോ?'}
            </p>
            <Link
              href="/register"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '11px 28px', borderRadius: 99,
                background: 'linear-gradient(135deg, oklch(0.62 0.22 340), oklch(0.58 0.20 10))',
                boxShadow: '0 4px 18px oklch(0.60 0.22 340 / 0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                color: 'white', fontWeight: 700, fontSize: 14,
                fontFamily: 'var(--font-anek), sans-serif',
                textDecoration: 'none',
              }}
            >
              {lang === 'en' ? 'Create an account' : 'അക്കൗണ്ട് ഉണ്ടാക്കാം'}
            </Link>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(180,160,240,0.35), transparent)' }} />
            <span
              className="font-cinzel"
              style={{ fontSize: 9, fontWeight: 700, color: 'oklch(0.58 0.08 270)', letterSpacing: '0.18em' }}
            >
              OR SIGN IN
            </span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(180,160,240,0.35), transparent)' }} />
          </div>

          <p
            className="font-anek"
            style={{ fontSize: 13, color: 'oklch(0.52 0.06 270)', marginBottom: 16 }}
          >
            {lang === 'en' ? 'Sign in to continue your journey' : 'യാത്ര തുടരാൻ ലോഗിൻ ചെയ്യൂ'}
          </p>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: 16, padding: '12px 16px', borderRadius: 15,
                background: 'rgba(254,202,202,0.35)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(239,68,68,0.28)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              <p className="font-anek" style={{ fontSize: 13, color: 'oklch(0.42 0.20 15)', fontWeight: 500 }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} suppressHydrationWarning>

            {/* Mobile */}
            <div suppressHydrationWarning>
              <label
                className="font-cinzel"
                style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'oklch(0.42 0.10 270)', marginBottom: 7, textTransform: 'uppercase' }}
              >
                {lang === 'en' ? 'Mobile Number 📱' : 'മൊബൈൽ നമ്പർ 📱'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                required
                maxLength={12}
                inputMode="numeric"
                pattern="[0-9]{10,12}"
                className="glass-input"
              />
            </div>

            {/* Password */}
            <div suppressHydrationWarning>
              <label
                className="font-cinzel"
                style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'oklch(0.42 0.10 270)', marginBottom: 7, textTransform: 'uppercase' }}
              >
                {lang === 'en' ? 'Password' : 'പാസ്സ്‌വേഡ്'}
              </label>
              <div style={{ position: 'relative' }} suppressHydrationWarning>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="glass-input"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'oklch(0.55 0.08 270)', background: 'none', border: 'none', cursor: 'pointer',
                    zIndex: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: 99, border: 'none',
                background: submitting
                  ? 'rgba(180,160,240,0.30)'
                  : 'linear-gradient(135deg, oklch(0.52 0.22 280), oklch(0.56 0.18 215))',
                boxShadow: submitting
                  ? 'none'
                  : '0 4px 24px oklch(0.52 0.22 280 / 0.38), inset 0 1px 0 rgba(255,255,255,0.25)',
                color: submitting ? 'oklch(0.55 0.10 270)' : 'white',
                fontFamily: 'var(--font-cinzel), serif',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.18s', marginTop: 4,
                zIndex: 3, position: 'relative',
              }}
            >
              {submitting ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(100,60,200,0.4)', borderTopColor: 'oklch(0.52 0.22 280)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  {lang === 'en' ? 'Signing in...' : 'ലോഗിൻ ചെയ്യുന്നു...'}
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {lang === 'en' ? "Let's Go!" : 'ആരംഭിക്കാം!'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
