'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { createUserProfile } from '@/lib/database';
import { useAuth } from '@/components/AuthProvider';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';

const STANDARDS = [
  'Bible kids',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
  'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
];


export default function RegisterPage() {
  const { user, loading } = useAuth();
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
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const syntheticEmail = `${form.phone}@kidsjourney.app`;
      const { data, error } = await supabase.auth.signUp({ email: syntheticEmail, password: form.password });
      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already in use')) {
          setError('This mobile number is already registered. Try logging in!');
        } else {
          setError('Something went wrong. Please try again.');
        }
        return;
      }
      await createUserProfile(data.user!.id, {
        name: form.name.trim(),
        houseName: form.houseName.trim(),
        parish: form.parish.trim(),
        standard: form.standard,
        phone: form.phone,
      });
      router.replace('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
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
          <div className="text-3xl">🌟</div>
          <h1 className="text-white font-bold text-lg">Start Your Journey!</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Form card */}
      <div className="bg-white rounded-t-4xl px-6 pt-6 pb-12 min-h-[calc(100vh-8rem)]">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Create your account</h2>
        <p className="text-gray-500 text-sm mb-5">Join the 30-day adventure with God!</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name ✨</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Anand Jose"
              required
              className={inputClass}
            />
          </div>

          {/* House Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">House Name 🏠</label>
            <input
              type="text"
              value={form.houseName}
              onChange={(e) => update('houseName', e.target.value)}
              placeholder="e.g. Arackal House"
              required
              className={inputClass}
            />
          </div>

          {/* Parish */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Parish ⛪</label>
            <input
              type="text"
              value={form.parish}
              onChange={(e) => update('parish', e.target.value)}
              placeholder="e.g. St. Mary's Vythiri"
              required
              className={inputClass}
            />
          </div>

          {/* Standard */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Standard (Class) 📚</label>
            <select
              value={form.standard}
              onChange={(e) => update('standard', e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select your class</option>
              {STANDARDS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number 📱</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit mobile number"
              required
              maxLength={10}
              pattern="[0-9]{10}"
              inputMode="numeric"
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password 🔒</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password ✅</label>
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
                Creating account...
              </>
            ) : (
              '🚀 Start My Journey!'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-600 font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
