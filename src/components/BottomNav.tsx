'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import { useLang } from '@/contexts/LanguageContext';

const navItems = [
  { href: '/dashboard', labelEn: 'Home', labelMl: 'ഹോം', icon: Home },
  { href: '/dashboard/winners', labelEn: 'Winners', labelMl: 'വിജയി', icon: Trophy },
  { href: '/dashboard/profile', labelEn: 'Profile', labelMl: 'പ്രൊഫൈൽ', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { lang, setLang } = useLang();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.42)',
        backdropFilter: 'blur(52px) saturate(2.2) brightness(1.06)',
        WebkitBackdropFilter: 'blur(52px) saturate(2.2) brightness(1.06)',
        boxShadow: [
          'inset 0 1px 0 rgba(255,255,255,0.98)',
          '0 -0.5px 0 rgba(180,160,240,0.18)',
          '0 -4px 24px rgba(100,60,200,0.07)',
        ].join(','),
      }}
    >
      <div className="flex items-start justify-around max-w-lg mx-auto px-2 pt-3.5 pb-2">
        {navItems.map(({ href, labelEn, labelMl, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 min-w-[54px] transition-all duration-200"
              style={{ color: isActive ? 'oklch(0.42 0.22 280)' : 'oklch(0.52 0.06 270)' }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.3 : 1.8}
                className="transition-all duration-200"
                style={{ transform: isActive ? 'scale(1.08)' : 'scale(1)' }}
              />
              <span
                className="text-[10.5px] font-medium"
                style={{ letterSpacing: '0.01em' }}
              >
                {lang === 'ml' ? labelMl : labelEn}
              </span>
            </Link>
          );
        })}

        {/* Language toggle */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="sg-pill convex"
            style={{ padding: '4px 5px', display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <button
              onClick={() => setLang('en')}
              className={clsx(
                'text-[11px] font-bold px-2 py-0.5 rounded-full transition-all',
              )}
              style={lang === 'en' ? {
                background: 'linear-gradient(135deg, oklch(0.52 0.22 280), oklch(0.56 0.18 215))',
                color: 'white',
                boxShadow: '0 2px 8px oklch(0.52 0.22 280 / 0.35)',
              } : {
                color: 'oklch(0.52 0.06 270)',
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ml')}
              className={clsx(
                'text-[11px] font-bold px-2 py-0.5 rounded-full transition-all',
              )}
              style={lang === 'ml' ? {
                background: 'linear-gradient(135deg, oklch(0.52 0.22 280), oklch(0.56 0.18 215))',
                color: 'white',
                boxShadow: '0 2px 8px oklch(0.52 0.22 280 / 0.35)',
              } : {
                color: 'oklch(0.52 0.06 270)',
              }}
            >
              മ
            </button>
          </div>
          <span className="text-[10.5px] font-medium" style={{ color: 'oklch(0.55 0.05 270)' }}>
            {lang === 'ml' ? 'ഭാഷ' : 'Lang'}
          </span>
        </div>
      </div>
    </nav>
  );
}
