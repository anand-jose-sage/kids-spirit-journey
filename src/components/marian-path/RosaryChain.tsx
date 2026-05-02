'use client';

import { useRef, useEffect } from 'react';
import RosaryBead, { BeadState } from './RosaryBead';
import { MarianProgress } from '@/lib/marian-path-db';
import { useRouter } from 'next/navigation';

interface RosaryChainProps {
  progress: MarianProgress[];
  currentDay: number;
}

function getBeadState(day: number, progress: MarianProgress[], currentDay: number): BeadState {
  const entry = progress.find((p) => p.day === day);
  if (entry?.completed) return 'completed';
  if (day === currentDay) return 'current';
  if (day <= currentDay) return 'available';
  return 'locked';
}

export default function RosaryChain({ progress, currentDay }: RosaryChainProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentRef.current && scrollRef.current) {
      requestAnimationFrame(() => {
        currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    }
  }, [currentDay]);

  return (
    <div className="w-full">
      {/* top connector */}
      <div className="flex justify-center mb-2">
        <div className="w-px h-6" style={{ background: 'linear-gradient(to bottom, transparent, rgba(56,189,248,0.30))' }} />
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto px-6 py-3"
        style={{ scrollbarWidth: 'none' }}
      >
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
          const isLarge = day % 6 === 0;
          const state = getBeadState(day, progress, currentDay);
          const isCurrent = day === currentDay;

          return (
            <div key={day} ref={isCurrent ? currentRef : null} className="flex items-center">
              <RosaryBead
                day={day}
                state={state}
                isLarge={isLarge}
                onClick={() => {
                  if (state !== 'locked') router.push(`/dashboard/marian-path/${day}`);
                }}
              />
              {day < 30 && (
                <div
                  className="w-3 h-px flex-shrink-0"
                  style={{
                    background:
                      state === 'completed'
                        ? 'linear-gradient(90deg, rgba(245,158,11,0.60), rgba(56,189,248,0.30))'
                        : 'rgba(56,189,248,0.10)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* bottom connector */}
      <div className="flex justify-center mt-2">
        <div className="w-px h-6" style={{ background: 'linear-gradient(to top, transparent, rgba(56,189,248,0.30))' }} />
      </div>
    </div>
  );
}
