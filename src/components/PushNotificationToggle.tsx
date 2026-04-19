'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { isPushSupported, getPushPermission, subscribeToPush, unsubscribeFromPush, isSubscribedToPush } from '@/lib/push';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { clsx } from 'clsx';
import { useLang } from '@/contexts/LanguageContext';

export default function PushNotificationToggle() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!isPushSupported()) return;
      setSupported(true);
      setDenied(getPushPermission() === 'denied');
      const sub = await isSubscribedToPush();
      setSubscribed(sub);
    };
    check();
  }, []);

  if (!supported || !user) return null;

  async function handleToggle() {
    if (!user || loading) return;
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribeFromPush(user.id);
        setSubscribed(false);
      } else {
        const ok = await subscribeToPush(user.id);
        setSubscribed(ok);
        if (!ok && getPushPermission() === 'denied') {
          setDenied(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  if (denied) {
    return (
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <BellOff size={18} className="text-gray-400 shrink-0" />
        <p className="text-gray-400 text-xs">
          {lang === 'ml' ? 'ബ്രൗസർ സെറ്റിംഗ്‌സിൽ അറിയിപ്പുകൾ അനുവദിക്കൂ' : 'Enable notifications in browser settings'}
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={clsx(
        'flex items-center gap-3 w-full rounded-2xl px-4 py-3 transition-all active:scale-[0.97]',
        subscribed
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-200'
          : 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-200'
      )}
    >
      <div className={clsx(
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/20'
      )}>
        {subscribed ? (
          <BellRing size={18} className="text-white" />
        ) : (
          <Bell size={18} className="text-white" />
        )}
      </div>
      <div className="text-left flex-1">
        <p className="text-sm font-bold text-white">
          {subscribed
            ? (lang === 'ml' ? '🔔 അറിയിപ്പുകൾ ഓൺ' : '🔔 Notifications ON')
            : (lang === 'ml' ? '🔔 അറിയിപ്പുകൾ ഓൺ ചെയ്യൂ' : '🔔 Turn On Notifications')}
        </p>
        <p className="text-[11px] mt-0.5 text-white/70">
          {subscribed
            ? (lang === 'ml' ? 'ടാപ്പ് ചെയ്ത് ഓഫ് ചെയ്യൂ' : 'Tap to turn off')
            : (lang === 'ml' ? 'ദൈനംദിന ദൗത്യങ്ങൾ നഷ്ടപ്പെടുത്തരുത്!' : "Don't miss daily missions & reminders!")}
        </p>
      </div>
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
      ) : subscribed ? (
        <span className="text-white text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">✓ ON</span>
      ) : null}
    </button>
  );
}
