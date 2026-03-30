'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Eye, EyeOff, Sparkles, X, Volume2, VolumeX } from 'lucide-react';

// WebM with alpha channel gives true transparent background (PNG effect)
// Convert: ffmpeg -i donkey.mp4 -vf "colorkey=white:0.15:0.05" -c:v libvpx-9 -auto-alt-ref 0 -pix_fmt yuva420p donkey.webm
const INTRO_VIDEO_URL = '/videos/donkey.webm';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.play().catch(() => {
      // Browser blocked unmuted autoplay — mute and retry
      video.muted = true;
      setMuted(true);
      video.play().catch(() => {});
    });
  }, []);

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700">
      {/* Donkey peeking from right */}
      {showVideo && (
        <div className="fixed z-50 right-0" style={{ top: '52%' }}>
          <div className="relative">
            <video
              ref={videoRef}
              src={INTRO_VIDEO_URL}
              playsInline
              className="w-40 rounded-l-2xl"
              onEnded={() => setShowVideo(false)}
            />
            <button
              onClick={toggleMute}
              className="absolute bottom-2 left-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
              aria-label="Close video"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      {/* Top section */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <img src="/images/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-4 rounded-full object-cover" />
        <h1 className="text-4xl font-bold text-white mb-1">ശിലോഹ <span className="text-2xl font-semibold">| Shiloha</span></h1>
        <p className="text-purple-200 text-base text-center">Your 30-day adventure with God</p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-white rounded-t-4xl px-6 pt-8 pb-12 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back! 👋</h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to continue your journey</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number 📱</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              required
              maxLength={12}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-base focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>

          <div suppressHydrationWarning>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative" suppressHydrationWarning>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pr-12 text-gray-800 text-base focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-purple-200 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Let's Go!
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          New here?{' '}
          <Link href="/register" className="text-purple-600 font-bold hover:text-purple-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
