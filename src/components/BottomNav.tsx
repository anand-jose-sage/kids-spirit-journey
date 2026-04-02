'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, User, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import { useLang } from '@/contexts/LanguageContext';

const navItems = [
  { href: '/dashboard', labelEn: 'Home', labelMl: 'ഹോം', icon: Home },
  { href: '/dashboard/activities', labelEn: 'Activities', labelMl: 'പ്രവൃത്തി', icon: BookOpen },
  { href: '/dashboard/winners', labelEn: 'Winners', labelMl: 'വിജയി', icon: Trophy },
  { href: '/dashboard/profile', labelEn: 'Profile', labelMl: 'പ്രൊഫൈൽ', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { lang, setLang } = useLang();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, labelEn, labelMl, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[54px]',
                isActive
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-400 hover:text-purple-400'
              )}
            >
              <Icon
                size={22}
                className={clsx('transition-all duration-200', isActive && 'scale-110')}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={clsx('text-xs font-medium', isActive ? 'text-purple-600' : 'text-gray-400')}>
                {lang === 'ml' ? labelMl : labelEn}
              </span>
            </Link>
          );
        })}

        {/* Language toggle */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5">
            <button
              onClick={() => setLang('en')}
              className={clsx(
                'text-xs font-bold px-2 py-1 rounded-full transition-all',
                lang === 'en' ? 'bg-purple-500 text-white' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ml')}
              className={clsx(
                'text-xs font-bold px-2 py-1 rounded-full transition-all',
                lang === 'ml' ? 'bg-purple-500 text-white' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              മ
            </button>
          </div>
          <span className="text-xs text-gray-400">{lang === 'ml' ? 'ഭാഷ' : 'Lang'}</span>
        </div>
      </div>
    </nav>
  );
}
