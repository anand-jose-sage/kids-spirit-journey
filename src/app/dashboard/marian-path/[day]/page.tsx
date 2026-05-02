'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useLang } from '@/contexts/LanguageContext';
import BottomNav from '@/components/BottomNav';
import {
  getMarianProgress,
  saveMarianQuizResult,
  saveMarianTextQuizResult,
  getLevelForDay,
  LEVEL_NAMES,
  MarianProgress,
} from '@/lib/marian-path-db';
import marianData from '@/data/marian-path.json';
import QuizCard from '@/components/marian-path/QuizCard';
import TextQuizCard from '@/components/marian-path/TextQuizCard';
import LevelBadge from '@/components/marian-path/LevelBadge';
import MarianAudioPlayer from '@/components/marian-path/MarianAudioPlayer';

type DayData = (typeof marianData.days)[0];

export default function MarianDayPage() {
  const router = useRouter();
  const params = useParams();
  const dayNum = Number(params.day);
  const { user } = useAuth();
  const { lang } = useLang();

  const [progress, setProgress] = useState<MarianProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const dayData: DayData | undefined = marianData.days.find((d) => d.day === dayNum);
  const level = getLevelForDay(dayNum);
  const levelName = LEVEL_NAMES[level];

  const load = useCallback(async () => {
    if (!user) return;
    const prog = await getMarianProgress(user.id);
    setProgress(prog);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!dayData || dayNum < 1 || dayNum > 30) {
      router.replace('/dashboard/marian-path');
      return;
    }
    load();
  }, [dayData, dayNum, load, router]);

  const todayDayNum = Math.min(new Date().getDate(), 30);

  const thisProgress = progress.find((p) => p.day === dayNum);
  const alreadyAnswered = thisProgress?.completed ?? false;

  const isLocked = dayNum > todayDayNum;
  const isViewOnly = dayNum < todayDayNum;

  useEffect(() => {
    if (!loading && isLocked) {
      router.replace('/dashboard/marian-path');
    }
  }, [loading, isLocked, router]);

  async function handleAnswer(selectedIndex: number, correct: boolean) {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      await saveMarianQuizResult(user.id, dayNum, correct);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTextAnswer(correct: boolean) {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      await saveMarianTextQuizResult(user.id, dayNum, correct);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  if (!dayData || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(100,60,200,0.15)', borderTopColor: 'oklch(0.52 0.22 280)' }}
        />
      </div>
    );
  }

  const title = lang === 'ml' && (dayData as any).ml_title ? (dayData as any).ml_title : dayData.title;
  const learningText = lang === 'ml' && dayData.learning_text_ml ? dayData.learning_text_ml : dayData.learning_text;
  const canGoPrev = dayNum > 1;
  const canGoNext = dayNum < 30 && (dayNum + 1) <= todayDayNum;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-5 pt-safe pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(180,160,240,0.15)' }}
      >
        <button
          onClick={() => router.push('/dashboard/marian-path')}
          className="back-btn"
          aria-label="Back to Marian Path"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex flex-col items-center gap-1">
          <LevelBadge level={level} size="sm" />
          <p
            className="font-cinzel"
            style={{ fontSize: 10, color: 'oklch(0.52 0.06 270)', letterSpacing: '0.20em', textTransform: 'uppercase' }}
          >
            {lang === 'ml' ? `ദി ${dayNum} / 30` : `Day ${dayNum} of 30`}
          </p>
        </div>

        <div style={{ width: 38 }} />
      </header>

      {/* Title */}
      <section className="relative z-10 px-5 pt-4 pb-3 flex-shrink-0">
        <h1
          className="font-display font-semibold leading-snug"
          style={{ fontSize: 24, color: 'oklch(0.2 0.06 270)' }}
        >
          {title}
        </h1>
        <p className="font-anek text-sm mt-0.5" style={{ color: 'oklch(0.52 0.08 270)' }}>
          {levelName}
        </p>
      </section>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-36" style={{ scrollbarWidth: 'none' }}>

        {/* Learning card */}
        <div
          className="sg-panel prism sg-noise"
          style={{ padding: '20px 20px', marginBottom: 16 }}
        >
          {/* Card header */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 14, paddingBottom: 12,
              borderBottom: '1px solid rgba(180,160,230,0.18)',
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 11, flexShrink: 0,
              background: 'linear-gradient(145deg, oklch(0.58 0.16 200 / 0.35), oklch(0.52 0.18 240 / 0.2))',
              border: '1px solid rgba(180,160,240,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
            }}>
              <BookOpen size={15} style={{ color: 'oklch(0.42 0.15 220)' }} />
            </div>
            <span
              className="font-cinzel"
              style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', color: 'oklch(0.42 0.12 270)', textTransform: 'uppercase' }}
            >
              {lang === 'ml' ? 'പഠനം' : 'Learning'}
            </span>
          </div>

          {/* Reading text on white scrim */}
          <div
            style={{
              background: 'rgba(255,255,255,0.58)', borderRadius: 14, padding: '14px 16px', marginBottom: 14,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), 0 0 0 0.5px rgba(180,160,240,0.15), 0 2px 8px rgba(100,60,200,0.05)',
            }}
          >
            <p
              className="font-anek"
              style={{ fontSize: 14.5, lineHeight: 1.75, color: 'oklch(0.26 0.05 270)' }}
            >
              {learningText}
            </p>
          </div>

          {dayData.learning_reference && (
            <p
              className="font-anek"
              style={{ fontSize: 14, fontStyle: 'italic', color: 'oklch(0.50 0.12 280)' }}
            >
              — {dayData.learning_reference}
            </p>
          )}
        </div>

        {/* Crystal audio player */}
        <MarianAudioPlayer
          src={`/audio/marian/marian-${dayNum}.mp3`}
          day={dayNum}
          language={lang}
        />

        {/* Quiz card */}
        <QuizCard
          question={lang === 'ml' && (dayData.quiz as any).question_ml ? (dayData.quiz as any).question_ml : dayData.quiz.question}
          options={lang === 'ml' && (dayData.quiz as any).options_ml ? (dayData.quiz as any).options_ml : dayData.quiz.options}
          correctIndex={dayData.quiz.correct_index}
          alreadyAnswered={alreadyAnswered}
          savedScore={thisProgress?.score}
          viewOnly={isViewOnly}
          language={lang}
          day={dayNum}
          onAnswer={handleAnswer}
        />

        {/* Bonus text quiz */}
        {(dayData as any).text_quiz && (
          <TextQuizCard
            question={lang === 'ml' && (dayData as any).text_quiz.question_ml ? (dayData as any).text_quiz.question_ml : (dayData as any).text_quiz.question}
            acceptedAnswers={[
              ...(dayData as any).text_quiz.accepted_answers,
              ...((dayData as any).text_quiz.alternative_answers ?? []),
            ]}
            textScore={thisProgress?.textScore ?? null}
            viewOnly={isViewOnly}
            language={lang}
            day={dayNum}
            onAnswer={handleTextAnswer}
          />
        )}

        {/* Prev / Next navigation */}
        {(canGoPrev || canGoNext) && (
          <div className="flex items-center justify-between mt-6 gap-3">
            {canGoPrev ? (
              <button
                onClick={() => router.push(`/dashboard/marian-path/${dayNum - 1}`)}
                className="flex items-center gap-1.5 font-cinzel transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: 'oklch(0.35 0.14 280)',
                  padding: '15px 28px',
                  borderRadius: 50,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.82), rgba(230,220,255,0.55))',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(200,185,255,0.50)',
                  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.95), 0 4px 18px rgba(140,100,240,0.15)',
                }}
              >
                <ChevronLeft size={14} />
                {lang === 'ml' ? `ദി ${dayNum - 1}` : `Day ${dayNum - 1}`}
              </button>
            ) : (
              <div />
            )}
            {canGoNext && (
              <button
                onClick={() => router.push(`/dashboard/marian-path/${dayNum + 1}`)}
                className="flex items-center gap-1.5 font-cinzel transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: 'oklch(0.35 0.14 280)',
                  padding: '15px 28px',
                  borderRadius: 50,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.82), rgba(230,220,255,0.55))',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(200,185,255,0.50)',
                  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.95), 0 4px 18px rgba(140,100,240,0.15)',
                }}
              >
                {lang === 'ml' ? `ദി ${dayNum + 1}` : `Day ${dayNum + 1}`}
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* Return link */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push('/dashboard/marian-path')}
            className="font-cinzel transition-colors"
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'oklch(0.35 0.14 280)',
              padding: '15px 40px',
              borderRadius: 50,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.82), rgba(230,220,255,0.55))',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(200,185,255,0.50)',
              boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.95), 0 4px 18px rgba(140,100,240,0.15)',
            }}
          >
            ← {lang === 'ml' ? 'മറ്റ് ദിവസങ്ങൾ' : 'All Days'}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
