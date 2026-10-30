import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const RENK = {
  beyaz: 'linear-gradient(#ffffff, #dedee6)',
  altin: 'linear-gradient(#ffec5a, #ff8c00)',
  kirmizi: 'linear-gradient(#ff4632, #be000a)',
};
export type Renk = keyof typeof RENK;

const yazi: React.CSSProperties = {
  fontFamily: 'Inter Display, Inter, sans-serif',
  fontWeight: 900,
  fontSize: 130,
  lineHeight: 1.0,
  letterSpacing: -2,
  whiteSpace: 'nowrap',
};

/** Kapak tarzı kalın 3B vurgu yazısı: siyah kontur + gölge katmanı altta, degrade dolgu üstte.
 *  Yay animasyonuyla büyüyerek gelir, sonunda söner. */
export const Vurgu: React.FC<{satirlar: {metin: string; renk: Renk}[]}> = ({satirlar}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const giris = spring({frame, fps, config: {damping: 12, stiffness: 180}});
  const scale = interpolate(giris, [0, 1], [1.6, 1]);
  const opacity =
    Math.min(giris * 1.5, 1) *
    interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: 220}}>
      <div style={{transform: `scale(${scale}) rotate(-2deg)`, opacity, textAlign: 'center'}}>
        {satirlar.map((s, i) => (
          <div key={i} style={{position: 'relative'}}>
            <div style={{...yazi, color: '#0a0505', WebkitTextStroke: '28px #0a0505', textShadow: '10px 10px 0 #190808'}}>
              {s.metin}
            </div>
            <div
              style={{
                ...yazi,
                position: 'absolute',
                inset: 0,
                backgroundImage: RENK[s.renk],
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {s.metin}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
