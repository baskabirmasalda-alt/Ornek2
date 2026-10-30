import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

export type Hareket = 'yakin' | 'uzak' | 'sol' | 'sag' | 'vurgu';

const HAREKET: Record<Hareket, [number, number, number]> = {
  // başlangıç yakınlığı, bitiş yakınlığı, yatay kayma (genişliğin oranı)
  yakin: [1.0, 1.14, 0],
  uzak: [1.14, 1.0, 0],
  sol: [1.1, 1.1, 0.05],
  sag: [1.1, 1.1, -0.05],
  vurgu: [1.25, 1.35, 0],
};

/** Ken Burns hareketli tek görsel. odak: [x, y] 0–1 arası, görselin nereye yaklaşılacağı. */
export const Sahne: React.FC<{gorsel: string; hareket?: Hareket; odak?: [number, number]}> = ({
  gorsel,
  hareket = 'yakin',
  odak = [0.5, 0.5],
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const [z0, z1, dx] = HAREKET[hareket];
  const u = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const z = z0 + (z1 - z0) * u;
  const x = dx * (u - 0.5) * 100;
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#0b0d1a'}}>
      <Img
        src={staticFile(gorsel)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translateX(${x}%) scale(${z})`,
          transformOrigin: `${odak[0] * 100}% ${odak[1] * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
};
