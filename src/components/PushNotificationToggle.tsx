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
      <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-600/40 rounded-xl p-4">
        <BellOff size={20} className="text-slate-400 shrink-0" />
        <div>
          <p className="text-slate-300 text-sm font-medium">
            {lang === 'ml' ? 'അറിയിപ്പുകൾ തടഞ്ഞിരിക്കുന്നു' : 'Notifications blocked'}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            {lang === 'ml'
              ? 'ബ്രൗസർ സെറ്റിംഗ്‌സിൽ അനുവദിക്കൂ'
              : 'Enable in browser settings to receive notifications'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={clsx(
        'flex items-center gap-3 w-full rounded-xl p-4 transition-all active:scale-[0.98] border',
        subscribed
          ? 'bg-emerald-500/10 border-emerald-400/30 hover:bg-emerald-500/20'
          : 'bg-slate-800/50 border-slate-600/40 hover:bg-slate-700/50'
      )}
    >
      {subscribed ? (
        <BellRing size={20} className="text-emerald-400 shrink-0" />
      ) : (
        <Bell size={20} className="text-slate-400 shrink-0" />
      )}
      <div className="text-left flex-1">
        <p className={clsx('text-sm font-medium', subscribed ? 'text-emerald-300' : 'text-slate-300')}>
          {subscribed
            ? (lang === 'ml' ? 'അറിയിപ്പുകൾ ഓൺ ✓' : 'Notifications ON ✓')
            : (lang === 'ml' ? 'അറിയിപ്പുകൾ ഓൺ ചെയ്യൂ' : 'Enable Notifications')}
        </p>
        <p className="text-slate-500 text-xs mt-0.5">
          {subscribed
            ? (lang === 'ml' ? 'ദൗത്യ അപ്‌ഡേറ്റുകളും ഓർമ്മപ്പെടുത്തലുകളും ലഭിക്കും' : 'You\'ll get mission updates & reminders')
            : (lang === 'ml' ? 'ദൈനംദിന ദൗത്യങ്ങൾ, ഓർമ്മപ്പെടുത്തലുകൾ' : 'Daily missions, activity reminders')}
        </p>
      </div>
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-emerald-400" />
      )}
    </button>
  );
}
