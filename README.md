# Kids Spirit Journey 🕊️

A spiritual journey app for children, built for the **Month of May** Marian devotion.  
Live at **[www.shiloha.in](https://www.shiloha.in)**

---

## About

Kids Spirit Journey is a Progressive Web App (PWA) that guides children and families through a 30-day Marian Path during the month of May. Each day unlocks new content — a reflection, an audio prayer, and quizzes — designed to deepen knowledge and love of Mary in a fun, engaging way.

The app supports both **English** and **Malayalam**, making it accessible to Kerala Catholic communities worldwide.

---

## Features

### 🌸 30-Day Marian Path
- Daily learning cards with scripture references
- Audio reflections for each day
- Multiple-choice quiz and a bonus text quiz per day
- Progressive levels: *Knowing Mary → Biblical & Prophetic Mary → Titles & Papal Teachings → Apparitions & Devotions → Living Like Mary*
- Rosary bead chain visualising journey progress

### 🏆 Scores & Leaderboard
- Points system starting from Day 3 (Days 1–2 are introductory)
- MCQ quiz: +10 pts | Text quiz: +100 pts
- Streak tracking, global rank, and total score
- 12 unlockable badges across streak, score, and journey milestones

### 🎮 Games
- **Memory Match** — card-flip memory game
- **Maze** — navigation puzzle
- **Match Puzzle** — drag-and-match activity

### 🔔 Push Notifications
- Web push notifications to remind children of their daily reflection

### 🌐 Bilingual
- Full English and Malayalam support across all content and UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | [Supabase](https://supabase.com) (Postgres + Auth) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Push Notifications | Web Push API |
| PWA | Service Worker + Web Manifest |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project

### Installation

```bash
git clone https://github.com/your-org/kids-spirit-journey.git
cd kids-spirit-journey
npm install
