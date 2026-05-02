'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { createUserProfile } from '@/lib/database';
import { useAuth } from '@/components/AuthProvider';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

const STANDARDS = [
  'Bathery', 'Chungakkunnu', 'Dwaraka', 'Kallodi', 'Kalpatta', 'Mananthavady', 'Payyampalli',
  'Thariode', 'Nadavayal', 'Mullenkolly', 'Neelagiri', 'Manimooly', 'Nilamboor'
];

export default function RegisterPage() {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    houseName: '',
    parish: '',
    standard: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { lang, setLang } = useLang();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setToast('Passwords do not match!');
      return;
    }
    if (form.password.length < 8) {
      setToast('Password must be at least 8 characters.');
      return;
    }
    if (!/^\d{10,12}$/.test(form.phone)) {
      setToast('Please enter a valid 10 to 12-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const syntheticEmail = `${form.phone}@kidsjourney.app`;
      const { data, error } = await supabase.auth.signUp({ email: syntheticEmail, password: form.password });
      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already in use')) {
          setToast('This mobile number is already registered. Try logging in!');
        } else {
          setToast('Something went wrong. Please try again.');
        }
        return;
      }
      if (!data.user) { setToast('Registration failed. Please try again.'); return; }
      await createUserProfile(data.user.id, {
        name: form.name.trim(),
        houseName: form.houseName.trim(),
        parish: form.parish.trim(),
        standard: form.standard,
        phone: form.phone,
      });
      await refreshProfile(data.user.id);
      router.replace('/dashboard');
    } catch {
      setToast('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: 'oklch(0.42 0.10 270)',
    marginBottom: 7,
    textTransform: 'uppercase',
    fontFamily: 'var(--font-cinzel), serif',
  };

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Decorative blobs */}
      <div
        className="aurora-blob pointer-events-none absolute"
        style={{
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(0.78 0.14 295 / 0.50) 0%, transparent 70%)',
          top: -60, right: -60, zIndex: 0,
        }}
      />
      <div
        className="aurora-blob pointer-events-none absolute"
        style={{
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, oklch(0.84 0.10 55 / 0.40) 0%, transparent 70%)',
          bottom: 80, left: -50, zIndex: 0, animationDelay: '3s',
        }}
      />

      {/* Header row */}
      <div
        className="relative z-10 flex items-center px-4 pt-safe"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)', paddingBottom: 12 }}
      >
        <Link href="/login" className="back-btn" aria-label="Back to login">
          <ChevronLeft size={20} />
        </Link>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src="/images/logo.png"
            alt="Logo"
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
          />
          <p
            className="font-display"
            style={{ fontSize: 13, fontWeight: 700, color: 'oklch(0.28 0.10 275)', marginTop: 3 }}
          >
            {lang === 'en' ? 'Start Your Journey!' : 'യാത്ര തുടങ്ങാം!'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'ml' : 'en')}
          className="sg-pill convex font-cinzel"
          style={{ padding: '5px 10px', fontSize: 10, fontWeight: 700, color: 'oklch(0.42 0.18 280)', border: 'none', cursor: 'pointer', position: 'relative', minWidth: 38, textAlign: 'center' }}
        >
          {lang === 'en' ? 'മല' : 'EN'}
        </button>
      </div>

      {/* Scrollable form */}
      <div className="relative z-10 px-4 pb-12" style={{ paddingBottom: 48 }}>
        <div className="sg-panel prism sg-noise" style={{ padding: '24px 20px' }}>

          <h2
            className="font-display"
            style={{ fontSize: 22, fontWeight: 700, color: 'oklch(0.20 0.08 270)', marginBottom: 4 }}
          >
            {lang === 'en' ? 'Create your account' : 'അക്കൗണ്ട് ഉണ്ടാക്കാം'}
          </h2>
          <p
            className="font-anek"
            style={{ fontSize: 13, color: 'oklch(0.52 0.06 270)', marginBottom: 22 }}
          >
            {lang === 'en' ? 'Join the 30-day adventure with God!' : 'ദൈവവുമൊത്ത് 30 ദിവസത്തെ യാത്രയിൽ ചേരൂ!'}
          </p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Name */}
            <div>
              <label style={labelStyle}>{lang === 'en' ? 'Your Name ✨' : 'നിന്റെ പേര് ✨'}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Anand Jose"
                required
                maxLength={100}
                className="glass-input"
              />
            </div>

            {/* House Name */}
            <div>
              <label style={labelStyle}>{lang === 'en' ? 'House Name 🏠' : 'വീടിന്റെ പേര് 🏠'}</label>
              <input
                type="text"
                value={form.houseName}
                onChange={(e) => update('houseName', e.target.value)}
                placeholder="e.g. Arackal House"
                required
                maxLength={100}
                className="glass-input"
              />
            </div>

            {/* Parish */}
            <div>
              <label style={labelStyle}>{lang === 'en' ? 'Parish ⛪' : 'ഇടവക ⛪'}</label>
              <input
                type="text"
                value={form.parish}
                onChange={(e) => update('parish', e.target.value)}
                placeholder="e.g. St. Mary's Vythiri"
                required
                maxLength={100}
                className="glass-input"
              />
            </div>

            {/* Meghala / Standard */}
            <div>
              <label style={labelStyle}>{lang === 'en' ? 'Meghala 📚' : 'മേഖല 📚'}</label>
              <select
                value={form.standard}
                onChange={(e) => update('standard', e.target.value)}
                required
                className="glass-input"
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
              >
                <option value="">{lang === 'en' ? 'Select your Meghala' : 'മേഖല തിരഞ്ഞെടുക്കൂ'}</option>
                {STANDARDS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Mobile */}
            <div>
              <label style={labelStyle}>{lang === 'en' ? 'Mobile Number 📱' : 'മൊബൈൽ നമ്പർ 📱'}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                required
                maxLength={12}
                pattern="[0-9]{10,12}"
                inputMode="numeric"
                className="glass-input"
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>{lang === 'en' ? 'Password 🔒' : 'പാസ്സ്‌വേഡ് 🔒'}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="glass-input"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'oklch(0.55 0.08 270)', background: 'none', border: 'none', cursor: 'pointer', zIndex: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>{lang === 'en' ? 'Confirm Password ✅' : 'പാസ്സ്‌വേഡ് സ്ഥിരീകരിക്കൂ ✅'}</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                placeholder="Same password again"
                required
                className="glass-input"
              />
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
                transition: 'all 0.18s', marginTop: 6,
                zIndex: 3, position: 'relative',
              }}
            >
              {submitting ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(100,60,200,0.4)', borderTopColor: 'oklch(0.52 0.22 280)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  {lang === 'en' ? 'Creating account...' : 'അക്കൗണ്ട് ഉണ്ടാക്കുന്നു...'}
                </>
              ) : (
                lang === 'en' ? '🚀 Start My Journey!' : '🚀 യാത്ര തുടങ്ങാം!'
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p
            className="font-anek"
            style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'oklch(0.52 0.06 270)' }}
          >
            {lang === 'en' ? 'Already have an account? ' : 'ഇതിനോടകം അക്കൗണ്ട് ഉണ്ടോ? '}
            <Link
              href="/login"
              style={{ color: 'oklch(0.42 0.20 280)', fontWeight: 700, textDecoration: 'none' }}
            >
              {lang === 'en' ? 'Sign in' : 'ലോഗിൻ ചെയ്യൂ'}
            </Link>
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="animate-fade-in-up"
          style={{
            position: 'fixed', bottom: 24, left: 16, right: 16, zIndex: 50,
            padding: '14px 18px', borderRadius: 18, textAlign: 'center',
            background: 'rgba(255,255,255,0.28)',
            backdropFilter: 'blur(52px) saturate(2.2)',
            WebkitBackdropFilter: 'blur(52px) saturate(2.2)',
            boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.98), 0 0 0 0.5px rgba(180,160,240,0.30), 0 8px 32px rgba(100,60,200,0.22)',
            border: '1px solid rgba(239,68,68,0.28)',
          }}
        >
          <p className="font-anek" style={{ fontSize: 13, color: 'oklch(0.32 0.18 15)', fontWeight: 600 }}>
            {toast}
          </p>
        </div>
      )}
    </div>
  );
}
