import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';

/** Kodla animasyon: süzülen kar taneleri (her kare için deterministik). */
export const Kar: React.FC<{adet?: number}> = ({adet = 90}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(adet).fill(0).map((_, i) => {
        const s = random(`s${i}`);
        const v = random(`v${i}`);
        const x = (random(`x${i}`) * width + 40 * Math.sin(t * 0.7 + v * 6)) % width;
        const y = (random(`y${i}`) * height + t * (30 + 50 * v)) % height;
        const r = 1 + 3 * s;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: 'white',
              opacity: 0.35 + 0.4 * s,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
