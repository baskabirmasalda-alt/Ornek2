import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

export type Kelime = {text: string; start: number; end: number};

/** Kelime kelime alt yazı: 3–5 kelimelik öbekler, söylenen kelime sarı yanar (karaoke). */
export const AltYazi: React.FC<{kelimeler: Kelime[]; maks?: number}> = ({kelimeler, maks = 5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const obekler: Kelime[][] = [];
  let cur: Kelime[] = [];
  for (const k of kelimeler) {
    cur.push(k);
    if (cur.length >= maks || /[.?!:…]$/.test(k.text)) {
      obekler.push(cur);
      cur = [];
    }
  }
  if (cur.length) obekler.push(cur);
  const ob = obekler.find((o) => o[0].start - 0.05 <= t && t < o[o.length - 1].end + 0.25);
  if (!ob) return null;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120}}>
      <div style={{fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 60, textAlign: 'center', maxWidth: 1600}}>
        {ob.map((k, i) => (
          <span
            key={i}
            style={{
              color: k.start <= t && t < k.end + 0.05 ? '#ffd650' : '#ffffff',
              WebkitTextStroke: '10px #0a050f',
              paintOrder: 'stroke fill',
              marginRight: 18,
            }}
          >
            {k.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
