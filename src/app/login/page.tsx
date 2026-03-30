'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Eye, EyeOff, Sparkles, X, Volume2, VolumeX } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';

// WebM with alpha channel gives true transparent background (PNG effect)
// Convert: ffmpeg -i donkey.mp4 -vf "colorkey=white:0.15:0.05" -c:v libvpx-9 -auto-alt-ref 0 -pix_fmt yuva420p donkey.webm
const INTRO_VIDEO_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/donkey.webm`;

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
  const { lang, setLang } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Auto-unmute on first user interaction regardless of how play started
    const unmuteOnInteraction = () => {
      if (video.muted) {
        video.muted = false;
        setMuted(false);
      }
      document.removeEventListener('click', unmuteOnInteraction);
    };
    document.addEventListener('click', unmuteOnInteraction);

    video.muted = false;
    video.play().catch(() => {
      // Browser blocked unmuted autoplay — mute and retry
      video.muted = true;
      setMuted(true);
      video.play().catch(() => {});
    });

    return () => {
      document.removeEventListener('click', unmuteOnInteraction);
      document.removeEventListener('touchstart', unmuteOnInteraction);
    };
  }, []);

  function toggleMute(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation();
    e.preventDefault();
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
              style={{ pointerEvents: 'none' }}
            />
            <button
              onTouchEnd={toggleMute}
              onClick={toggleMute}
              className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 hover:bg-black/80 text-white rounded-full pl-1 pr-2 py-1 transition-colors"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {muted && <span className="text-xs leading-none">Tap to unmute</span>}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowVideo(false); }}
              className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
              aria-label="Close video"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      {/* Top section */}
      <div className="flex flex-col items-center pt-8 pb-8 px-6">
        <img src="/images/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-4 rounded-full object-cover" />
        <h1 className="text-4xl font-bold text-white mb-1">ശിലോഹ <span className="text-2xl font-semibold">| Shiloha</span></h1>
        <div className="mt-2 mb-1 px-5 py-2 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 border border-yellow-200/50 text-center shadow-lg">
          <p className="text-white font-bold text-base tracking-wide" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.8), -1px -1px 4px rgba(0,0,0,0.6)'}}>ചെറുപുഷ്‌പ മിഷൻ ലീഗ്</p>
          <p className="text-yellow-100 text-sm font-semibold" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.8), -1px -1px 4px rgba(0,0,0,0.6)'}}>മാനന്തവാടി രൂപത</p>
        </div>
        <p className="text-purple-200 text-base text-center mt-1">Your 30-day adventure with God</p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-white rounded-t-4xl px-6 pt-8 pb-12 shadow-2xl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back! 👋</h2>
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'ml' : 'en')}
            className="text-xs font-bold px-3 py-1 rounded-full border-2 border-purple-400 text-purple-600 hover:bg-purple-50 transition-colors"
          >
            {lang === 'en' ? 'മലയാളം' : 'EN'}
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-6">Sign in to continue your journey</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{lang === 'en' ? 'Mobile Number 📱' : 'മൊബൈൽ നമ്പർ 📱'}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit mobile number"
              required
              maxLength={12}
              inputMode="numeric"
              pattern="[0-9]{10,12}"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-base focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>

          <div suppressHydrationWarning>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{lang === 'en' ? 'Password' : 'പാസ്സ്‌വേഡ്'}</label>
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
                {lang === 'en' ? 'Signing in...' : 'ലോഗിൻ ചെയ്യുന്നു...'}
              </>
            ) : (
              <>
                <Sparkles size={18} />
                {lang === 'en' ? "Let's Go!" : 'ആരംഭിക്കാം!'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-base mb-0.5">{lang === 'en' ? 'New here?' : 'പുതിയ അംഗമോ?'}</p>
          <Link href="/register" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg text-center shadow-md hover:from-pink-600 hover:to-rose-600 active:scale-95 transition-all">
            {lang === 'en' ? 'Create an account' : 'അക്കൗണ്ട് ഉണ്ടാക്കാം'}
          </Link>
        </div>
      </div>
    </div>
  );
}
