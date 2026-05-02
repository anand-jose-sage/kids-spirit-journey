'use client';

import { useState } from 'react';

interface TextQuizCardProps {
  question: string;
  acceptedAnswers: string[];
  textScore: number | null; // null = not attempted, 0 = wrong, 100 = correct
  viewOnly?: boolean;
  language?: 'en' | 'ml';
  day?: number;
  onAnswer: (correct: boolean) => Promise<void>;
}

function normalize(s: string): string {
  // eslint-disable-next-line no-misleading-character-class
  const diacritics = /[̀-ͯ]/g;
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(diacritics, '')
    .replace(/[.,!?;:'"()\-_/]/g, '')
    .replace(/\b(the|a|an|saint|st)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function checkAnswer(input: string, accepted: string[]): boolean {
  const n = normalize(input);
  return accepted.some((a) => {
    const na = normalize(a);
    if (na === n) return true;
    // also accept if the core answer appears as a word in the user's input
    if (na.length >= 2) {
      const escaped = na.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`\\b${escaped}\\b`).test(n)) return true;
    }
    return false;
  });
}

export default function TextQuizCard({
  question,
  acceptedAnswers,
  textScore,
  viewOnly = false,
  language = 'en',
  day = 1,
  onAnswer,
}: TextQuizCardProps) {
  const showPoints = day >= 3;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const alreadyDone = textScore !== null;
  const wasCorrect = textScore !== null && textScore > 0;

  async function handleSubmit() {
    if (!input.trim() || loading || alreadyDone) return;
    setLoading(true);
    const correct = checkAnswer(input, acceptedAnswers);
    try {
      await onAnswer(correct);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div
      className="sg-panel prism sg-noise"
      style={{ padding: '20px 20px', marginTop: 16 }}
    >
      {/* Label */}
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          className="sg-pill convex"
          style={{ padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <span style={{ fontSize: 9 }}>✦</span>
          <span
            className="font-cinzel"
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: 'oklch(0.42 0.22 280)' }}
          >
            {language === 'ml'
              ? (showPoints ? 'ക്വിസ് · +100' : 'ക്വിസ്')
              : (showPoints ? 'QUIZ · +100' : 'QUIZ')}
          </span>
        </div>
      </div>

      <p
        className="font-anek"
        style={{ fontSize: 17, fontWeight: 600, color: 'oklch(0.2 0.06 270)', marginBottom: 16, lineHeight: 1.5 }}
      >
        {question}
      </p>

      {!alreadyDone && viewOnly ? (
        <div
          style={{
            padding: '12px 14px', borderRadius: 15,
            background: 'rgba(180,160,240,0.10)',
            backdropFilter: 'blur(12px)',
            border: '1px solid oklch(0.65 0.12 270 / 0.25)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.12 270)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          <div>
            <p className="font-cinzel" style={{ fontSize: 11, color: 'oklch(0.45 0.10 270)', fontWeight: 500 }}>
              {language === 'ml' ? '○ കഴിഞ്ഞ ദിവസം · കാണൽ മോഡ്' : '○ Past day · View only'}
            </p>
            <p className="font-anek" style={{ fontSize: 11.5, color: 'oklch(0.42 0.08 270)', marginTop: 3 }}>
              {language === 'ml' ? 'ഉത്തരം: ' : 'Answer: '}
              <span style={{ fontWeight: 600, color: 'oklch(0.30 0.10 270)' }}>{acceptedAnswers[0]}</span>
            </p>
          </div>
        </div>
      ) : !alreadyDone ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'ml' ? 'ഉത്തരം ടൈപ്പ് ചെയ്യുക...' : 'Type your answer...'}
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 16px',
              borderRadius: 15,
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-anek), sans-serif',
              fontSize: 14,
              background: 'rgba(255,255,255,0.58)',
              backdropFilter: 'blur(24px) saturate(2)',
              WebkitBackdropFilter: 'blur(24px) saturate(2)',
              boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.98), 0 0 0 0.5px rgba(180,160,240,0.2), 0 3px 12px rgba(100,60,200,0.07)',
              color: 'oklch(0.28 0.05 270)',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            style={{
              width: '100%',
              padding: '13px 16px',
              borderRadius: 15,
              border: 'none',
              fontFamily: 'var(--font-cinzel), serif',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              background: !input.trim() || loading
                ? 'rgba(180,160,240,0.18)'
                : 'linear-gradient(145deg, oklch(0.52 0.22 280), oklch(0.44 0.20 295))',
              color: !input.trim() || loading ? 'oklch(0.62 0.08 270)' : 'white',
              boxShadow: !input.trim() || loading
                ? 'none'
                : 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 16px oklch(0.52 0.22 280 / 0.35)',
              transition: 'all 0.18s',
            }}
          >
            {loading
              ? (language === 'ml' ? 'സമർപ്പിക്കുന്നു...' : 'Submitting...')
              : (language === 'ml' ? 'സമർപ്പിക്കുക' : 'SUBMIT')}
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 15,
            background: wasCorrect
              ? 'rgba(134,239,172,0.20)'
              : 'rgba(254,202,202,0.20)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: wasCorrect
              ? 'inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px oklch(0.62 0.18 145 / 0.35)'
              : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(239,68,68,0.25)',
          }}
        >
          {wasCorrect ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                background: 'linear-gradient(145deg, oklch(0.55 0.20 145), oklch(0.48 0.18 160))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 3px 8px oklch(0.55 0.20 145 / 0.35)',
              }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="font-cinzel" style={{ fontSize: 12, fontWeight: 700, color: 'oklch(0.32 0.14 145)' }}>
                  {language === 'ml'
                    ? (showPoints ? '✦ ശരി · +100 പോയിന്റ്' : '✦ ശരി')
                    : (showPoints ? '✦ Correct · +100 points' : '✦ Correct')}
                </p>
                <p className="font-anek" style={{ fontSize: 11.5, color: 'oklch(0.42 0.10 155)', marginTop: 2 }}>
                  {language === 'ml' ? 'അസാധാരണ!' : 'Outstanding!'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                background: 'rgba(254,202,202,0.5)',
                border: '1px solid rgba(239,68,68,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="oklch(0.52 0.20 15)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div>
                <p className="font-cinzel" style={{ fontSize: 12, fontWeight: 700, color: 'oklch(0.42 0.18 15)' }}>
                  {language === 'ml' ? '○ തെറ്റ്' : '○ Incorrect'}
                </p>
                <p className="font-anek" style={{ fontSize: 12, color: 'oklch(0.38 0.08 270)', marginTop: 3, lineHeight: 1.5 }}>
                  {language === 'ml' ? 'ശരിയായ ഉത്തരം: ' : 'Answer: '}
                  <span style={{ fontWeight: 600, color: 'oklch(0.30 0.10 270)' }}>
                    {acceptedAnswers[0]}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
