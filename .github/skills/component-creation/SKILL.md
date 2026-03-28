---
name: component-creation
description: "Scaffold new pages, components, and features for the kids-spirit-journey Next.js app. Use when: creating a new page, adding a dashboard route, building a shared component, adding a new activity feature, or scaffolding UI with Tailwind and Firebase integration."
argument-hint: "Describe what page or component to create (e.g., 'leaderboard page', 'prayer tracker component')"
---

# Component & Page Creation

## When to Use

- Creating a new page under `src/app/`
- Adding a new dashboard route under `src/app/dashboard/`
- Building a shared component in `src/components/`
- Adding Firestore-backed features with real-time data
- Scaffolding UI that matches the existing purple-gradient, mobile-first design

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Lucide React icons, Framer Motion |
| Styling | Tailwind CSS 3 with custom purple palette, clsx for conditional classes |
| Auth | Firebase Auth (email/password) via `AuthProvider` context |
| Database | Firestore (`kids-spirit-data` collection) |
| Effects | Canvas Confetti for celebrations |
| Types | TypeScript (strict mode), path alias `@/*` → `./src/*` |

## Procedure

### 1. Create a New Page

All pages use the `'use client'` directive for auth checks and real-time data.

**File location:** `src/app/<route>/page.tsx` (or `src/app/dashboard/<route>/page.tsx` for dashboard routes)

**Page template:**

```tsx
'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageName() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 pb-24 px-5 pt-6">
      {/* Page content */}
    </div>
  );
}
```

**Key patterns:**
- Auth guard via `useAuth()` + redirect to `/login`
- Loading spinner while auth/profile resolves
- Bottom padding `pb-24` to clear the `BottomNav`
- Consistent gradient background: `bg-gradient-to-br from-purple-50 to-indigo-100`

### 2. Create a Shared Component

**File location:** `src/components/ComponentName.tsx` (PascalCase)

```tsx
'use client';

interface ComponentNameProps {
  // typed props
}

export default function ComponentName({ ...props }: ComponentNameProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* Component content */}
    </div>
  );
}
```

### 3. Add Dynamic Routes

For parameterized routes (like `/dashboard/activity/[day]`):

**File location:** `src/app/dashboard/<route>/[param]/page.tsx`

```tsx
'use client';

import { use } from 'react';

type Params = Promise<{ param: string }>;

export default function DynamicPage({ params }: { params: Params }) {
  const { param } = use(params);
  // ...
}
```

### 4. Add Firestore Data

Add types and functions to `src/lib/firestore.ts`:

```tsx
// Export interface for new data shape
export interface NewEntity {
  field: string;
  createdAt: Timestamp | null;
}

// Firestore operations follow this pattern:
export async function getEntity(uid: string, id: string): Promise<NewEntity | null> {
  const ref = doc(db, 'users', uid, 'subcollection', id);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as NewEntity) : null;
}

export async function saveEntity(uid: string, id: string, data: Omit<NewEntity, 'createdAt'>): Promise<void> {
  const ref = doc(db, 'users', uid, 'subcollection', id);
  await setDoc(ref, { ...data, savedAt: Timestamp.now() }, { merge: true });
}
```

**Real-time listeners** use `onSnapshot()` in components (see AuthProvider pattern).

### 5. Add to Bottom Navigation (if needed)

Edit `src/components/BottomNav.tsx` to add a new nav item with a Lucide icon.

## Styling Conventions

| Element | Classes |
|---------|---------|
| Page background | `bg-gradient-to-br from-purple-50 to-indigo-100` |
| Cards | `bg-white rounded-2xl p-4 shadow-sm` or `rounded-3xl` |
| Primary buttons | `bg-purple-600 text-white rounded-xl px-6 py-3` |
| Section headers | `text-lg font-bold text-gray-800` |
| Gradients (headers) | `bg-gradient-to-br from-purple-600 to-indigo-700 text-white` |
| Icons | Lucide React, `size={22}` for nav, `size={16}` for inline |
| Spacing | `px-5` page horizontal, `py-4` vertical, `gap-4` between items |
| Animations | `animate-bounce-slow`, `animate-pulse-slow`, `animate-wiggle` (custom) |
| Conditional classes | Use `clsx()` for state-based styling |

## Custom Color Palette

The `primary` color extends purple shades (50–900) defined in `tailwind.config.ts`.

## File Naming Rules

| Type | Convention | Example |
|------|-----------|---------|
| Pages | `page.tsx` in route folder | `src/app/dashboard/new-route/page.tsx` |
| Components | PascalCase `.tsx` | `src/components/PrayerCard.tsx` |
| Libraries | kebab-case `.ts` | `src/lib/firestore.ts` |
| Data files | kebab-case `.json` | `src/data/activities.json` |
| Directories | lowercase/kebab-case | `src/app/dashboard/new-route/` |

## Checklist

- [ ] `'use client'` directive at top of file
- [ ] Auth guard with redirect to `/login`
- [ ] Loading spinner while auth resolves
- [ ] Bottom padding (`pb-24`) on pages for BottomNav clearance
- [ ] TypeScript interfaces for all data shapes
- [ ] Imports use `@/` path alias
- [ ] Consistent purple gradient background
- [ ] Mobile-first design (root layout constrains to `max-w-lg`)
