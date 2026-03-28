'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, List, User } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/activities', label: 'Activities', icon: BookOpen },
  { href: '/dashboard/timeline', label: 'Journey', icon: List },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[60px]',
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
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
