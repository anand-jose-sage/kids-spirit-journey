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

  const inputClass =
    'w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-base focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700">
      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-6">
        <Link href="/login" className="text-white p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex-1 text-center">
          <img src="/images/logo.png" alt="Logo" className="w-10 h-10 mx-auto rounded-full object-cover" />
          <h1 className="text-white font-bold text-lg">{lang === 'en' ? 'Start Your Journey!' : 'യാത്ര തുടങ്ങാം!'}</h1>
        </div>
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'ml' : 'en')}
          className="text-xs font-bold px-3 py-1 rounded-full border-2 border-white/60 text-white hover:bg-white/10 transition-colors w-10"
        >
          {lang === 'en' ? 'മല' : 'EN'}
        </button>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-t-4xl px-6 pt-6 pb-12 min-h-[calc(100vh-8rem)]">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{lang === 'en' ? 'Create your account' : 'അക്കൗണ്ട് ഉണ്ടാക്കാം'}</h2>
        <p className="text-gray-500 text-sm mb-5">{lang === 'en' ? 'Join the 30-day adventure with God!' : 'ദൈവവുമൊത്ത് 30 ദിവസത്തെ യാത്രയിൽ ചേരൂ!'}</p>


        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{lang === 'en' ? 'Your Name ✨' : 'നിന്റെ പേര് ✨'}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Anand Jose"
              required
              maxLength={100}
              className={inputClass}
            />
          </div>

          {/* House Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{lang === 'en' ? 'House Name 🏠' : 'വീടിന്റെ പേര് 🏠'}</label>
            <input
              type="text"
              value={form.houseName}
              onChange={(e) => update('houseName', e.target.value)}
              placeholder="e.g. Arackal House"
              required
              maxLength={100}
              className={inputClass}
            />
          </div>

          {/* Parish */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{lang === 'en' ? 'Parish ⛪' : 'ഇടവക ⛪'}</label>
            <input
              type="text"
              value={form.parish}
              onChange={(e) => update('parish', e.target.value)}
              placeholder="e.g. St. Mary's Vythiri"
              required
              maxLength={100}
              className={inputClass}
            />
          </div>

          {/* Standard */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{lang === 'en' ? 'Meghala 📚' : 'മേഖല 📚'}</label>
            <select
              value={form.standard}
              onChange={(e) => update('standard', e.target.value)}
              required
              className={inputClass}
            >
              <option value="">{lang === 'en' ? 'Select your Meghala' : 'മേഖല തിരഞ്ഞെടുക്കൂ'}</option>
              {STANDARDS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{lang === 'en' ? 'Mobile Number 📱' : 'മൊബൈൽ നമ്പർ 📱'}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit mobile number"
              required
              maxLength={12}
              pattern="[0-9]{10,12}"
              inputMode="numeric"
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{lang === 'en' ? 'Password 🔒' : 'പാസ്സ്‌വേഡ് 🔒'}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{lang === 'en' ? 'Confirm Password ✅' : 'പാസ്സ്‌വേഡ് സ്ഥിരീകരിക്കൂ ✅'}</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              placeholder="Same password again"
              required
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-purple-200 active:scale-95 transition-all disabled:opacity-70 mt-2 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {lang === 'en' ? 'Creating account...' : 'അക്കൗണ്ട് ഉണ്ടാക്കുന്നു...'}
              </>
            ) : (
              lang === 'en' ? '🚀 Start My Journey!' : '🚀 യാത്ര തുടങ്ങാം!'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          {lang === 'en' ? 'Already have an account?' : 'ഇതിനോടകം അക്കൗണ്ട് ഉണ്ടോ?'}{' '}
          <Link href="/login" className="text-purple-600 font-bold">
            {lang === 'en' ? 'Sign in' : 'ലോഗിൻ ചെയ്യൂ'}
          </Link>
        </p>
      </div>
      {toast && (
        <div className="fixed bottom-6 left-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3.5 rounded-2xl shadow-xl text-center animate-fade-in-up">
          {toast}
        </div>
      )}
    </div>
  );
}
