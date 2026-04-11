import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your free Shiloha account and start a 30-day spiritual adventure for kids.',
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
