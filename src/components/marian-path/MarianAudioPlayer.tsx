'use client';

import { useState, useRef, useCallback } from 'react';

function buildWaveform(seed: number, bars = 38): number[] {
  const result: number[] = [];
  let s = Math.abs(seed * 31 + 7) || 1;
  for (let i = 0; i < bars; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    result.push((s % 60 + 22) / 100);
  }
  return result;
}

function fmt(secs: number) {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Props {
  src: string;
  day: number;
  language?: 'en' | 'ml';
}

export default function MarianAudioPlayer({ src, day, language = 'en' }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const waveform = buildWaveform(day);

  const handleTimeUpdate = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    setCurrentTime(a.currentTime);
    setProgress(a.duration ? a.currentTime / a.duration : 0);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, []);

  function togglePlay() {
    const a = audioRef.current;
    if (!a || loadError) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setLoadError(true));
    }
  }

  function seekByClick(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current;
    if (!a || !waveformRef.current || !loaded) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * a.duration;
    setProgress(ratio);
  }

  if (loadError) return null;

  return (
    <div className="sg-panel prism sg-noise" style={{ padding: '18px 20px', marginBottom: 16 }}>
      {/* Label pill */}
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          className="sg-pill convex"
          style={{ padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <svg width={9} height={9} viewBox="0 0 24 24" fill="oklch(0.52 0.18 280)" stroke="none">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span
            className="font-cinzel"
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: 'oklch(0.42 0.18 280)' }}
          >
            {language === 'ml' ? 'കേൾക്കുക' : 'LISTEN'}
          </span>
        </div>
      </div>

      {/* Crystal player bubble */}
      <div
        style={{
          position: 'relative',
          borderRadius: 22,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.38)',
          backdropFilter: 'blur(40px) saturate(2.8) brightness(1.05)',
          WebkitBackdropFilter: 'blur(40px) saturate(2.8) brightness(1.05)',
          boxShadow:
            'inset 0 2px 0 rgba(255,255,255,0.96), inset 0 -1px 0 rgba(180,160,240,0.18), 0 0 0 0.75px rgba(200,185,255,0.30), 0 8px 32px rgba(100,60,200,0.14)',
        }}
      >
        {/* Top specular sheen */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '52%',
            borderRadius: '22px 22px 70% 70% / 22px 22px 40px 40px',
            background:
              'radial-gradient(ellipse 88% 55% at 50% -8%, rgba(255,255,255,0.60) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Bottom tint */}
        <div
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '35%',
            borderRadius: '0 0 22px 22px',
            background:
              'linear-gradient(to top, rgba(170,140,255,0.10) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration);
            setLoaded(true);
          }}
          onEnded={handleEnded}
          onError={() => setLoadError(true)}
        />

        {/* Crystal play / pause button */}
        <button
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          style={{
            position: 'relative',
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: 'none',
            flexShrink: 0,
            cursor: 'pointer',
            background: playing
              ? 'linear-gradient(148deg, oklch(0.54 0.22 280), oklch(0.44 0.21 298))'
              : 'linear-gradient(148deg, oklch(0.60 0.18 278 / 0.92), oklch(0.50 0.23 296 / 0.88))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: playing
              ? 'inset 0 1.5px 0 rgba(255,255,255,0.32), 0 5px 22px oklch(0.52 0.22 280 / 0.58), 0 0 0 1px oklch(0.52 0.22 280 / 0.22)'
              : 'inset 0 2.5px 0 rgba(255,255,255,0.62), inset 0 -1px 0 rgba(0,0,0,0.12), 0 5px 22px oklch(0.52 0.22 280 / 0.38), 0 0 0 1px rgba(220,210,255,0.40)',
            transition: 'all 0.16s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Button specular */}
          <div
            style={{
              position: 'absolute',
              top: 3, left: 5, right: 5,
              height: '42%',
              borderRadius: '50%',
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.52) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
          {playing ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', zIndex: 1 }}>
              <div style={{ width: 3.5, height: 14, borderRadius: 2.5, background: 'rgba(255,255,255,0.96)' }} />
              <div style={{ width: 3.5, height: 14, borderRadius: 2.5, background: 'rgba(255,255,255,0.96)' }} />
            </div>
          ) : (
            <div
              style={{
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '8.5px 0 8.5px 15px',
                borderColor: 'transparent transparent transparent rgba(255,255,255,0.96)',
                marginLeft: 3,
                zIndex: 1,
              }}
            />
          )}
        </button>

        {/* Waveform + timestamps */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
          <div
            ref={waveformRef}
            onClick={seekByClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
              height: 34,
              cursor: loaded ? 'pointer' : 'default',
              userSelect: 'none',
            }}
          >
            {waveform.map((h, i) => {
              const filled = i / waveform.length <= progress;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h * 100}%`,
                    borderRadius: 3,
                    background: filled
                      ? 'linear-gradient(to top, oklch(0.50 0.24 282), oklch(0.65 0.16 275))'
                      : 'rgba(180,155,245,0.30)',
                    boxShadow: filled ? '0 0 5px oklch(0.52 0.22 280 / 0.45)' : 'none',
                    transition: 'background 0.07s',
                  }}
                />
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span
              className="font-cinzel"
              style={{ fontSize: 9, color: 'oklch(0.44 0.12 280)', letterSpacing: '0.04em' }}
            >
              {fmt(currentTime)}
            </span>
            <span
              className="font-cinzel"
              style={{ fontSize: 9, color: 'oklch(0.56 0.06 270)', letterSpacing: '0.04em' }}
            >
              {fmt(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
