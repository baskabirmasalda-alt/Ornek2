import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

/** Kuzey ışıkları: gökyüzünde dalgalanan yeşil-mor perdeler (SVG, ekran karışımı). */
export const KuzeyIsiklari: React.FC<{guc?: number}> = ({guc = 0.55}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const perde = (i: number, renk: string) => {
    const pts: string[] = [];
    for (let x = 0; x <= 1920; x += 60) {
      const y = 180 + 70 * Math.sin(x / 260 + t * 0.6 + i * 1.7) + 40 * Math.sin(x / 120 - t * 0.9 + i);
      pts.push(`${x},${y.toFixed(1)}`);
    }
    return (
      <polygon key={i} points={`0,0 ${pts.join(' ')} 1920,0`} fill={`url(#g${i})`} opacity={0.5 + 0.2 * Math.sin(t + i)} />
    );
  };
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: guc, filter: 'blur(28px)'}}>
      <svg width="1920" height="1080">
        <defs>
          {['#38ff9c', '#8f5bff', '#3fe0ff'].map((c, i) => (
            <linearGradient key={i} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c} stopOpacity="0" />
              <stop offset="0.7" stopColor={c} stopOpacity="0.9" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {perde(0, '#38ff9c')}
        {perde(1, '#8f5bff')}
        {perde(2, '#3fe0ff')}
      </svg>
    </AbsoluteFill>
  );
};

/** Mum ışığı: belirli bir noktada titreyen sıcak ışık halesi. */
export const MumIsigi: React.FC<{x: number; y: number}> = ({x, y}) => {
  const frame = useCurrentFrame();
  const f = 0.75 + 0.15 * Math.sin(frame * 0.9) + 0.1 * random(`m${Math.floor(frame / 2)}`);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: 'screen',
        background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,190,90,${0.55 * f}) 0%, rgba(255,140,40,${0.25 * f}) 12%, transparent 30%)`,
      }}
    />
  );
};

/** Işık huzmeleri: yukarıdan süzülen, yavaşça dönen altın ışınlar. */
export const IsikHuzmesi: React.FC = () => {
  const frame = useCurrentFrame();
  const a = -20 + Math.sin(frame / 60) * 6;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: 'screen',
        opacity: 0.35,
        background: `repeating-conic-gradient(from ${a}deg at 80% -10%, rgba(255,220,150,0.5) 0deg 4deg, transparent 4deg 13deg)`,
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 85%)',
      }}
    />
  );
};

/** Kırılma: görsel üçgen parçalara ayrılıp dağılır (aynanın paramparça olması). */
export const Kirilma: React.FC<{gorsel: string; odak?: [number, number]}> = ({gorsel, odak = [0.6, 0.45]}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const u = interpolate(frame, [4, durationInFrames], [0, 1], {extrapolateLeft: 'clamp', easing: Easing.out(Easing.cubic)});
  const C = 9;
  const R = 6;
  const nokta = (i: number, j: number): [number, number] => {
    const kenar = i === 0 || j === 0 || i === C || j === R;
    const jx = kenar ? 0 : (random(`x${i}-${j}`) - 0.5) * 0.8;
    const jy = kenar ? 0 : (random(`y${i}-${j}`) - 0.5) * 0.8;
    return [((i + jx) / C) * width, ((j + jy) / R) * height];
  };
  const ucgenler: [number, number][][] = [];
  for (let i = 0; i < C; i++)
    for (let j = 0; j < R; j++) {
      const a = nokta(i, j), b = nokta(i + 1, j), c = nokta(i + 1, j + 1), d = nokta(i, j + 1);
      ucgenler.push([a, b, c], [a, c, d]);
    }
  const cx = odak[0] * width, cy = odak[1] * height;
  return (
    <AbsoluteFill style={{backgroundColor: '#05070f'}}>
      {ucgenler.map((tri, k) => {
        const mx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
        const my = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
        const yon = Math.atan2(my - cy, mx - cx);
        const hiz = 300 + 900 * random(`h${k}`);
        const tx = Math.cos(yon) * hiz * u;
        const ty = Math.sin(yon) * hiz * u + 200 * u * u;
        const rot = (random(`r${k}`) - 0.5) * 140 * u;
        const poly = tri.map(([x, y]) => `${x}px ${y}px`).join(',');
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: `polygon(${poly})`,
              transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`,
              transformOrigin: `${mx}px ${my}px`,
              opacity: 1 - u * 0.6,
              filter: `brightness(${1 + 0.6 * u})`,
            }}
          >
            <Img src={staticFile(gorsel)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        );
      })}
      <AbsoluteFill style={{background: `radial-gradient(circle at ${odak[0] * 100}% ${odak[1] * 100}%, rgba(255,255,255,${0.9 * (1 - u)}) 0%, transparent ${10 + 40 * u}%)`}} />
    </AbsoluteFill>
  );
};

/** Buzlanma: bir noktadan yayılan buz kristali dokusu (SVG gürültü filtresi + büyüyen maske). */
export const Buz: React.FC<{merkez?: [number, number]}> = ({merkez = [0.5, 0.6]}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const u = interpolate(frame, [0, durationInFrames * 0.7], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const son = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  const r = 5 + 60 * u;
  const mask = `radial-gradient(circle at ${merkez[0] * 100}% ${merkez[1] * 100}%, black ${r * 0.6}%, transparent ${r}%)`;
  return (
    <AbsoluteFill style={{maskImage: mask, WebkitMaskImage: mask, opacity: 0.75 * son, mixBlendMode: 'screen'}}>
      <svg width="1920" height="1080">
        <filter id="buz">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="4" seed="7" />
          <feColorMatrix values="0 0 0 0 0.75  0 0 0 0 0.9  0 0 0 0 1  0 0 0 2.6 -1.2" />
        </filter>
        <rect width="1920" height="1080" filter="url(#buz)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Üç sır: sırayla parlayarak beliren üç buz kristali. */
export const Kristaller: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const son = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 120, opacity: son, paddingBottom: 120}}>
      {[0, 1, 2].map((i) => {
        const g = interpolate(frame, [i * 0.35 * fps, i * 0.35 * fps + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const parla = 0.6 + 0.4 * Math.sin(frame / 6 + i);
        return (
          <div key={i} style={{transform: `scale(${0.4 + 0.6 * g}) translateY(${(1 - g) * 60}px)`, opacity: g}}>
            <svg width="150" height="220" viewBox="0 0 150 220" style={{filter: `drop-shadow(0 0 ${30 * parla}px #9fe7ff)`}}>
              <polygon points="75,0 140,70 110,220 40,220 10,70" fill="rgba(200,240,255,0.85)" stroke="#ffffff" strokeWidth="4" />
              <polygon points="75,0 110,70 75,220 40,70" fill="rgba(255,255,255,0.5)" />
              <text x="75" y="150" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="64" fill="#0b2a4a">
                {i + 1}
              </text>
            </svg>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
