'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useLang } from '@/contexts/LanguageContext';
import {
  getMarianProgress,
  getMarianStats,
  getMarianBadges,
  MarianProgress,
  MarianStats,
  MarianBadge,
  STREAK_MILESTONES,
  SCORE_MILESTONES,
} from '@/lib/marian-path-db';
import BottomNav from '@/components/BottomNav';
import PushNotificationToggle from '@/components/PushNotificationToggle';
import { LogOut, Home, Church, School } from 'lucide-react';

/* ── Milestone progress bar ─────────────────────────────────────────────────── */
function MilestoneTrack({ current, milestones, color }: { current: number; milestones: number[]; color: string }) {
  const max = milestones[milestones.length - 1];
  const fillPct = Math.min(100, Math.round((current / max) * 100));

  return (
    <div>
      <div
        style={{
          height: 6, borderRadius: 99,
          background: 'rgba(180,160,240,0.18)',
          boxShadow: 'inset 0 1px 3px rgba(100,60,200,0.10)',
          overflow: 'hidden', position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%', width: `${fillPct}%`, borderRadius: 99,
            background: color,
            boxShadow: `0 0 10px ${color}80`,
            position: 'relative', overflow: 'hidden',
            transition: 'width 0.7s ease',
          }}
        >
          {/* shine sweep */}
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%', width: '35%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65) 50%, transparent)',
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, paddingInline: 2 }}>
        {milestones.map((m) => (
          <span
            key={m}
            className="font-cinzel"
            style={{ fontSize: 9.5, color: current >= m ? 'oklch(0.38 0.10 270)' : 'oklch(0.62 0.04 270)' }}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Badge card (horizontal scroll) ─────────────────────────────────────────── */
function BadgeTile({ badge, lang }: { badge: MarianBadge; lang: string }) {
  return (
    <div
      style={{
        flexShrink: 0, width: 86, borderRadius: 18, padding: '12px 8px',
        textAlign: 'center',
        background: badge.unlocked ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        boxShadow: badge.unlocked ? [
          'inset 0 1.5px 0 rgba(255,255,255,0.98)',
          '0 0 0 0.5px rgba(180,160,240,0.25)',
          '0 4px 16px rgba(100,60,200,0.10)',
        ].join(',') : [
          'inset 0 1px 0 rgba(255,255,255,0.6)',
          '0 0 0 0.5px rgba(180,160,240,0.12)',
        ].join(','),
        opacity: badge.unlocked ? 1 : 0.6,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6, filter: badge.unlocked ? 'none' : 'grayscale(1) opacity(0.5)' }}>
        {badge.emoji}
      </div>
      <p
        className="font-cinzel"
        style={{ fontSize: 10, fontWeight: 600, color: 'oklch(0.32 0.06 270)', lineHeight: 1.3, marginBottom: badge.description ? 3 : 0 }}
      >
        {lang === 'ml' ? badge.titleMl : badge.title}
      </p>
      {!badge.unlocked && badge.description && (
        <p style={{ fontSize: 9.5, color: 'oklch(0.55 0.06 270)' }}>
          {lang === 'ml' ? badge.descriptionMl : badge.description}
        </p>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();

  const [marianProgress, setMarianProgress] = useState<MarianProgress[]>([]);
  const [marianStats, setMarianStats] = useState<MarianStats>({ totalScore: 0, streakDays: 0, rank: 1, completedCount: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([getMarianProgress(user.id), getMarianStats(user.id)]).then(([prog, stats]) => {
      setMarianProgress(prog);
      setMarianStats(stats);
      setStatsLoading(false);
    });
  }, [user]);

  if (loading || !profile) return null;

  const badges = getMarianBadges(marianProgress, marianStats.streakDays);
  const streakBadges  = badges.filter((b) => b.category === 'streak');
  const scoreBadges   = badges.filter((b) => b.category === 'score');
  const journeyBadges = badges.filter((b) => b.category === 'journey');
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <div className="min-h-screen pb-nav relative overflow-x-hidden">

      {/* ── Header with gradient + avatar + stats ── */}
      <div
        style={{
          flexShrink: 0, position: 'relative', textAlign: 'center', overflow: 'hidden',
          padding: '52px 20px 24px',
          background: 'linear-gradient(175deg, oklch(0.84 0.11 295 / 0.9) 0%, oklch(0.88 0.08 195 / 0.6) 55%, transparent 100%)',
        }}
      >
        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(145deg, oklch(0.58 0.22 280), oklch(0.62 0.18 200))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: 'white',
            fontFamily: 'var(--font-display), Georgia, serif',
            boxShadow: [
              'inset 0 1.5px 0 rgba(255,255,255,0.7)',
              '0 0 0 2px rgba(255,255,255,0.6)',
              '0 0 0 4px rgba(180,140,255,0.22)',
              '0 8px 28px oklch(0.52 0.22 280 / 0.38)',
            ].join(','),
          }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <h2 className="font-display" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.04em', color: 'oklch(0.2 0.08 270)', marginBottom: 4 }}>
          {profile.name}
        </h2>
        <p style={{ fontSize: 13, color: 'oklch(0.48 0.08 270)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>📱</span> {profile.phone}
        </p>

        {/* Stat chips */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
          {[
            { val: marianStats.completedCount, label: lang === 'ml' ? 'ദിവസം'     : 'Days',   icon: '🕊️', accent: 'oklch(0.42 0.20 280)' },
            { val: marianStats.streakDays,     label: lang === 'ml' ? 'സ്ട്രീക്ക്' : 'Streak', icon: '🔥',  accent: 'oklch(0.55 0.22 55)'  },
            { val: marianStats.totalScore,     label: lang === 'ml' ? 'പോയൻ്റ്'   : 'Points', icon: '✦',   accent: 'oklch(0.52 0.16 310)' },
          ].map(({ val, label, icon, accent }) => (
            <div key={label} className="sg-card" style={{ width: 96, padding: '12px 8px', textAlign: 'center' }}>
              <div className="font-display" style={{ fontSize: 30, fontWeight: 700, color: accent, lineHeight: 1, marginBottom: 4 }}>
                {statsLoading ? '–' : val}
              </div>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 11, color: 'oklch(0.48 0.08 270)', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* ── Streak & Score ── */}
        <div className="sg-panel prism sg-noise" style={{ padding: '18px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <span className="font-display" style={{ fontSize: 17, fontWeight: 600, color: 'oklch(0.25 0.06 270)' }}>
              {lang === 'ml' ? 'സ്ട്രീക്ക് & സ്കോർ' : 'Streak & Score'}
            </span>
          </div>

          {/* Streak row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(145deg, oklch(0.55 0.22 55), oklch(0.48 0.22 30))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 16px oklch(0.55 0.22 55 / 0.35)',
            }}>🔥</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span className="font-display" style={{ fontSize: 32, fontWeight: 700, color: 'oklch(0.55 0.22 55)', lineHeight: 1 }}>
                  {marianStats.streakDays}
                </span>
                <span style={{ fontSize: 13, color: 'oklch(0.45 0.08 270)', fontWeight: 500 }}>
                  {lang === 'ml' ? 'ദിവസം തുടർച്ച' : 'day streak'}
                </span>
              </div>
              <MilestoneTrack current={marianStats.streakDays} milestones={STREAK_MILESTONES} color="linear-gradient(90deg, oklch(0.65 0.22 55), oklch(0.58 0.22 30))" />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(180,160,240,0.15)', marginBottom: 20 }} />

          {/* Score row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(145deg, oklch(0.62 0.18 280), oklch(0.55 0.22 260))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 16px oklch(0.58 0.20 280 / 0.35)',
            }}>⭐</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span className="font-display" style={{ fontSize: 32, fontWeight: 700, color: 'oklch(0.52 0.22 280)', lineHeight: 1 }}>
                  {marianStats.totalScore}
                </span>
                <span style={{ fontSize: 13, color: 'oklch(0.45 0.08 270)', fontWeight: 500 }}>
                  {lang === 'ml' ? 'മൊത്തം പോയൻ്റ്' : 'total points'}
                </span>
              </div>
              <MilestoneTrack current={marianStats.totalScore} milestones={SCORE_MILESTONES} color="linear-gradient(90deg, oklch(0.62 0.20 280), oklch(0.58 0.18 240))" />
            </div>
          </div>
        </div>

        {/* ── Badges ── */}
        <div className="sg-panel prism sg-noise" style={{ padding: '18px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🏅</span>
              <span className="font-display" style={{ fontSize: 17, fontWeight: 600, color: 'oklch(0.25 0.06 270)' }}>
                {lang === 'ml' ? 'ബാഡ്ജുകൾ' : 'Badges'}
              </span>
            </div>
            <span className="font-cinzel font-bold" style={{ fontSize: 12, color: 'oklch(0.52 0.18 280)' }}>
              {unlockedCount}/{badges.length}
            </span>
          </div>

          {/* Streak badges */}
          <p className="font-cinzel" style={{ fontSize: 11, fontWeight: 700, color: 'oklch(0.55 0.18 55)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            🔥 {lang === 'ml' ? 'സ്ട്രീക്ക്' : 'Streak'}
          </p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 18, scrollbarWidth: 'none' }}>
            {streakBadges.map((badge) => <BadgeTile key={badge.id} badge={badge} lang={lang} />)}
          </div>

          {/* Score badges */}
          <p className="font-cinzel" style={{ fontSize: 11, fontWeight: 700, color: 'oklch(0.52 0.18 280)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            ⭐ {lang === 'ml' ? 'സ്കോർ' : 'Score'}
          </p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 18, scrollbarWidth: 'none' }}>
            {scoreBadges.map((badge) => <BadgeTile key={badge.id} badge={badge} lang={lang} />)}
          </div>

          {/* Journey badges */}
          <p className="font-cinzel" style={{ fontSize: 11, fontWeight: 700, color: 'oklch(0.52 0.16 200)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            🕊️ {lang === 'ml' ? 'യാത്ര' : 'Journey'}
          </p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {journeyBadges.map((badge) => <BadgeTile key={badge.id} badge={badge} lang={lang} />)}
          </div>
        </div>

        {/* ── Profile details ── */}
        <div className="sg-card sg-noise" style={{ padding: '18px 18px' }}>
          <p className="font-cinzel" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'oklch(0.52 0.08 270)', textTransform: 'uppercase', marginBottom: 14 }}>
            {lang === 'ml' ? 'എൻ്റെ വിവരങ്ങൾ' : 'My Details'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { Icon: Home,   label: lang === 'ml' ? 'ഭവനം'  : 'House',  value: profile.houseName },
              { Icon: Church, label: lang === 'ml' ? 'ഇടവക' : 'Parish', value: profile.parish    },
              { Icon: School, label: lang === 'ml' ? 'ക്ലാസ്'  : 'Class',  value: profile.standard  },
            ].map(({ Icon, label, value }) => (
              <div
                key={label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.5)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 0.5px rgba(180,160,240,0.18)',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                  background: 'linear-gradient(145deg, rgba(180,160,240,0.25), rgba(180,160,240,0.12))',
                  border: '1px solid rgba(180,160,240,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                }}>
                  <Icon size={15} style={{ color: 'oklch(0.42 0.18 280)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 10, color: 'oklch(0.55 0.06 270)', marginBottom: 1 }}>{label}</p>
                  <p className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'oklch(0.25 0.06 270)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Credits ── */}
        <div className="sg-card" style={{ padding: '18px 20px', textAlign: 'center' }}>
          <p className="font-cinzel" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', color: 'oklch(0.55 0.08 270)', textTransform: 'uppercase', marginBottom: 6 }}>
            ✦ Conceptualized by ✦
          </p>
          <p className="font-display" style={{ fontSize: 17, fontWeight: 700, color: 'oklch(0.28 0.10 275)', lineHeight: 1.2, marginBottom: 6 }}>
            Cherupushpa Mission League
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ height: 1, width: 32, borderRadius: 99, background: 'rgba(180,160,240,0.4)' }} />
            <span style={{ fontSize: 10, color: 'rgba(180,160,240,0.6)' }}>✦</span>
            <div style={{ height: 1, width: 32, borderRadius: 99, background: 'rgba(180,160,240,0.4)' }} />
          </div>
          <p className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'oklch(0.42 0.14 275)' }}>
            Manathvady Diocese
          </p>
          <p style={{ fontSize: 11, color: 'oklch(0.60 0.06 270)', margin: '2px 0' }}>&amp;</p>
          <p className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'oklch(0.42 0.14 275)' }}>
            Kalpatta Meghala
          </p>
        </div>

        {/* ── Push Notifications ── */}
        <PushNotificationToggle />

        {/* ── Sign out ── */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 font-cinzel font-semibold transition-all active:scale-[0.97]"
          style={{
            padding: '14px 20px', borderRadius: 99, border: 'none',
            background: 'rgba(255,255,255,0.42)',
            backdropFilter: 'blur(36px) saturate(2)',
            WebkitBackdropFilter: 'blur(36px) saturate(2)',
            boxShadow: [
              'inset 0 1.5px 0 rgba(255,255,255,0.98)',
              '0 0 0 1px rgba(239,68,68,0.25)',
              '0 4px 16px rgba(239,68,68,0.10)',
            ].join(','),
            color: 'oklch(0.48 0.20 15)',
            fontSize: 13, cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          <LogOut size={16} />
          {lang === 'ml' ? 'സൈൻ ഔട്ട്' : 'Sign Out'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
