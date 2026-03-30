'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Headphones } from 'lucide-react';

// Deterministic waveform heights per day (lcg-seeded so each day looks different but is stable)
function buildWaveform(seed: number, bars = 40): number[] {
  const result: number[] = [];
  let s = Math.abs(seed) || 1;
  for (let i = 0; i < bars; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    result.push((s % 65 + 20) / 100); // 0.20 – 0.84
  }
  return result;
}

function fmt(secs: number) {
  if (!isFinite(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Props {
  src: string;
  day: number;
  label?: string;
}

export default function BibleAudioPlayer({ src, day, label }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);   // 0–1
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const waveform = buildWaveform(day);

  // Sync progress from audio element
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

  if (loadError) return null; // silently hide if no audio file

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <Headphones size={18} className="text-purple-500" />
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
          {label ?? 'Bible Reflection'}
        </h2>
      </div>

      {/* WhatsApp-style player bubble */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl px-4 py-3 flex items-center gap-3">
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

        {/* Play / Pause button */}
        <button
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-200 active:scale-95 transition-all"
        >
          {playing
            ? <Pause size={16} fill="white" strokeWidth={0} />
            : <Play size={16} fill="white" strokeWidth={0} className="ml-0.5" />
          }
        </button>

        {/* Waveform bars */}
        <div
          ref={waveformRef}
          onClick={seekByClick}
          className="flex-1 flex items-center gap-[2px] h-9 cursor-pointer select-none"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          {waveform.map((h, i) => {
            const filled = i / waveform.length <= progress;
            return (
              <div
                key={i}
                className={`rounded-full flex-1 transition-colors duration-75 ${
                  filled ? 'bg-purple-600' : 'bg-purple-200'
                }`}
                style={{ height: `${h * 100}%` }}
              />
            );
          })}
        </div>

        {/* Time display */}
        <span className="text-purple-500 text-xs font-mono flex-shrink-0 w-9 text-right tabular-nums">
          {playing || currentTime > 0 ? fmt(currentTime) : fmt(duration)}
        </span>
      </div>
    </div>
  );
}
