'use client';

import { useState } from 'react';

interface QuizCardProps {
  question: string;
  options: string[];
  correctIndex: number;
  alreadyAnswered?: boolean;
  savedScore?: number;
  viewOnly?: boolean;
  language?: 'en' | 'ml';
  day?: number;
  onAnswer: (selectedIndex: number, correct: boolean) => Promise<void>;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizCard({
  question,
  options,
  correctIndex,
  alreadyAnswered = false,
  savedScore,
  viewOnly = false,
  language = 'en',
  day = 1,
  onAnswer,
}: QuizCardProps) {
  const showPoints = day >= 3;
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(alreadyAnswered);
  const [loading, setLoading] = useState(false);

  const prevCorrect = alreadyAnswered && savedScore !== undefined && savedScore > 0;

  async function handleSelect(idx: number) {
    if (revealed || loading || viewOnly) return;
    setSelected(idx);
    setRevealed(true);
    setLoading(true);
    const correct = idx === correctIndex;
    try {
      await onAnswer(idx, correct);
    } finally {
      setLoading(false);
    }
  }

  function optionStyle(idx: number): React.CSSProperties {
    const base: React.CSSProperties = {
      width: '100%', padding: '13px 16px', borderRadius: 15, border: 'none',
      fontFamily: 'var(--font-anek), sans-serif', fontSize: 14,
      cursor: (viewOnly && !alreadyAnswered) ? 'default' : 'pointer',
      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
      transition: 'all 0.18s', position: 'relative', overflow: 'hidden',
    };

    // View-only past day: highlight correct, dim others
    if (viewOnly && !alreadyAnswered) {
      if (idx === correctIndex) return {
        ...base,
        background: 'rgba(134,239,172,0.18)',
        backdropFilter: 'blur(24px) saturate(2)',
        WebkitBackdropFilter: 'blur(24px) saturate(2)',
        boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.95), 0 0 0 1px oklch(0.62 0.18 145 / 0.4)',
        color: 'oklch(0.28 0.10 155)',
      };
      return {
        ...base,
        background: 'rgba(255,255,255,0.22)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
        color: 'oklch(0.52 0.04 270)',
        opacity: 0.55,
      };
    }

    if (!revealed) return {
      ...base,
      background: 'rgba(255,255,255,0.48)',
      backdropFilter: 'blur(24px) saturate(2)',
      WebkitBackdropFilter: 'blur(24px) saturate(2)',
      boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.98), 0 0 0 0.5px rgba(180,160,240,0.2), 0 3px 12px rgba(100,60,200,0.07)',
      color: 'oklch(0.28 0.05 270)',
    };

    if (idx === correctIndex) return {
      ...base,
      background: 'rgba(134,239,172,0.28)',
      backdropFilter: 'blur(24px) saturate(2)',
      WebkitBackdropFilter: 'blur(24px) saturate(2)',
      boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.95), 0 0 0 1px oklch(0.62 0.18 145 / 0.5), 0 4px 16px oklch(0.60 0.18 145 / 0.15)',
      color: 'oklch(0.25 0.08 155)',
    };

    if (idx === selected && idx !== correctIndex) return {
      ...base,
      background: 'rgba(254,202,202,0.25)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(239,68,68,0.35)',
      color: 'oklch(0.42 0.18 15)',
    };

    return {
      ...base,
      background: 'rgba(255,255,255,0.30)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 0 0 0.5px rgba(180,160,240,0.12)',
      color: 'oklch(0.45 0.05 270)',
      opacity: 0.65,
    };
  }

  return (
    <div className="sg-panel prism sg-noise" style={{ padding: '20px 20px' }}>
      {/* Quiz label */}
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          className="sg-pill convex"
          style={{ padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <span style={{ fontSize: 9 }}>✦</span>
          <span
            className="font-cinzel"
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: 'oklch(0.42 0.18 280)' }}
          >
            {language === 'ml' ? 'നാം ഇന്ന് പഠിച്ചത്' : 'What we learned today'}
          </span>
        </div>
      </div>

      <p
        className="font-anek"
        style={{ fontSize: 19, fontWeight: 600, color: 'oklch(0.2 0.06 270)', marginBottom: 14, lineHeight: 1.45 }}
      >
        {question}
      </p>

      {/* View-only notice for past days (not yet answered) */}
      {viewOnly && !alreadyAnswered && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 12, marginBottom: 14,
            background: 'rgba(180,160,240,0.10)',
            backdropFilter: 'blur(12px)',
            border: '1px solid oklch(0.65 0.12 270 / 0.25)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.12 270)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          <span className="font-cinzel" style={{ fontSize: 11, color: 'oklch(0.45 0.10 270)', fontWeight: 500 }}>
            {language === 'ml' ? '○ കഴിഞ്ഞ ദിവസം · കാണൽ മോഡ്' : '○ Past day · View only'}
          </span>
        </div>
      )}

      {/* Already answered notice */}
      {alreadyAnswered && !selected && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 12, marginBottom: 14,
            background: 'rgba(167,139,250,0.10)',
            backdropFilter: 'blur(12px)',
            border: '1px solid oklch(0.65 0.18 280 / 0.28)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <div
            style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '1.5px solid oklch(0.60 0.18 280)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'oklch(0.60 0.18 280)' }} />
          </div>
          <span
            className="font-cinzel"
            style={{ fontSize: 12, color: 'oklch(0.42 0.12 270)', fontWeight: 500 }}
          >
            {prevCorrect
              ? (language === 'ml'
                  ? (showPoints ? '✦ ശരിയായ ഉത്തരം · +10 pts' : '✦ ശരിയായ ഉത്തരം')
                  : (showPoints ? '✦ You answered correctly · +10 pts' : '✦ You answered correctly'))
              : (language === 'ml' ? '○ നിങ്ങൾ ഈ ചോദ്യം ഉത്തരിച്ചു' : '○ You answered this question')}
          </span>
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {options.map((opt, idx) => {
          const isCorrect = revealed && idx === correctIndex;
          const isWrong = revealed && idx === selected && idx !== correctIndex;

          const isViewCorrect = viewOnly && !alreadyAnswered && idx === correctIndex;

          return (
            <button key={idx} style={optionStyle(idx)} onClick={() => handleSelect(idx)}>
              {/* Specular for correct */}
              {(isCorrect || isViewCorrect) && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 15,
                  background: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(255,255,255,0.45) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
              )}

              {/* Option label badge */}
              <div style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                background: (isCorrect || isViewCorrect)
                  ? 'linear-gradient(145deg, oklch(0.55 0.20 145), oklch(0.48 0.18 160))'
                  : isWrong
                  ? 'rgba(254,202,202,0.5)'
                  : 'rgba(180,160,240,0.18)',
                border: `1px solid ${(isCorrect || isViewCorrect) ? 'transparent' : isWrong ? 'rgba(239,68,68,0.4)' : 'rgba(180,160,240,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: (isCorrect || isViewCorrect)
                  ? 'inset 0 1px 0 rgba(255,255,255,0.3), 0 3px 8px oklch(0.55 0.20 145 / 0.35)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.7)',
              }}>
                <span
                  className="font-cinzel"
                  style={{
                    fontSize: 10.5, fontWeight: 700,
                    color: (isCorrect || isViewCorrect) ? 'white' : isWrong ? 'oklch(0.42 0.18 15)' : 'oklch(0.42 0.1 270)',
                  }}
                >
                  {OPTION_LABELS[idx]}
                </span>
              </div>

              <span style={{ fontWeight: (isCorrect || isViewCorrect) ? 600 : 400, flex: 1 }}>{opt}</span>

              {(isCorrect || isViewCorrect) && (
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="oklch(0.50 0.20 145)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {isWrong && (
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="oklch(0.52 0.20 15)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Result feedback */}
      {revealed && !alreadyAnswered && (
        <p
          className="font-cinzel text-center"
          style={{
            fontSize: 12, marginTop: 16,
            color: selected === correctIndex ? 'oklch(0.42 0.18 145)' : 'oklch(0.48 0.08 270)',
          }}
        >
          {selected === correctIndex
            ? (language === 'ml'
                ? (showPoints ? '✦ ശരി · +10 പോയിന്റ്' : '✦ ശരി')
                : (showPoints ? '✦ Correct · +10 points' : '✦ Correct'))
            : (language === 'ml' ? '○ ശരിയായ ഉത്തരം മുകളിൽ കാണാം' : '○ The correct answer is highlighted above')}
        </p>
      )}
    </div>
  );
}
