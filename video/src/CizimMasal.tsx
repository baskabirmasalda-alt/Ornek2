import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {AltYazi} from './bilesenler/AltYazi';
import {Hareket} from './bilesenler/Sahne';
import {SAHNELER} from './cizim/Sahneler';
import {MasalVerisi} from './Masal';

// Görsel üreten model kullanmadan, her şeyi kodla (SVG) çizen bölüm.
// Kurgu verisi Masal ile aynıdır; sahne numaraları cizim/Sahneler.tsx'teki çizimlere karşılık gelir.

const HAREKET: Record<Hareket, [number, number, number]> = {
  yakin: [1.0, 1.12, 0],
  uzak: [1.12, 1.0, 0],
  sol: [1.08, 1.08, 0.04],
  sag: [1.08, 1.08, -0.04],
  vurgu: [1.22, 1.32, 0],
  detay: [1.7, 1.82, 0],
};
const GECIS = 10;

/** Kamera hareketi + boya dokusu: çizim ve tuval birlikte hareket eder. */
const Kamera: React.FC<{hareket?: Hareket; odak?: [number, number]; children: React.ReactNode}> = ({hareket = 'yakin', odak = [0.5, 0.5], children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const [z0, z1, dx] = HAREKET[hareket] ?? HAREKET.yakin;
  const u = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const z = z0 + (z1 - z0) * u;
  const opacity = interpolate(frame, [0, GECIS], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity}}>
      <AbsoluteFill style={{transform: `translateX(${dx * (u - 0.5) * 100}%) scale(${z})`, transformOrigin: `${odak[0] * 100}% ${odak[1] * 100}%`, filter: 'saturate(1.12) contrast(1.06)'}}>
        {children}
        <Img src={staticFile('assets/b05/cizim/tuval.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'soft-light', opacity: 0.55}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Köşede küçük kâğıt etiket (ortalanmış dev başlık yerine). */
const Etiket: React.FC<{satirlar: {metin: string; renk: string}[]}> = ({satirlar}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const g = spring({frame, fps, config: {damping: 16, stiffness: 140}});
  const cik = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: 64,
        top: 104,
        transform: `translateX(${(1 - g) * -40}px) rotate(-2deg)`,
        opacity: g * cik,
        background: '#f6ead0',
        border: '3px solid #8a5a34',
        borderRadius: 6,
        padding: '10px 22px',
        boxShadow: '4px 6px 0 rgba(60,30,10,0.35)',
        fontFamily: '"DejaVu Serif", serif',
        fontWeight: 700,
        fontSize: 40,
        lineHeight: 1.15,
        color: '#5a3420',
      }}
    >
      {satirlar.map((s, i) => (
        <div key={i} style={{color: s.renk === 'kirmizi' ? '#b5302a' : s.renk === 'altin' ? '#a8701c' : '#5a3420'}}>
          {s.metin}
        </div>
      ))}
    </div>
  );
};

export const CizimMasal: React.FC<{veri: MasalVerisi}> = ({veri}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const olay: Record<string, number> = {};
  for (const a of veri.animasyonlar ?? []) olay[a.tur] = a.bas;

  const muzikSes = (kare: number) => {
    const t = kare / fps;
    const konusuyor = veri.kelimeler.some((k) => k.start - 0.15 <= t && t <= k.end + 0.25);
    let v = konusuyor ? 0.12 : 0.3;
    for (const s of veri.sessizlik ?? []) {
      if (t >= s.bas - s.sure && t < s.bas + 0.15) v *= 0.05;
      else if (t >= s.bas + 0.15 && t < s.bas + 0.6) v *= interpolate(t, [s.bas + 0.15, s.bas + 0.6], [0.05, 1]);
    }
    return v * interpolate(t, [veri.sure - 2, veri.sure], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#3a2416'}}>
      {veri.planlar.map((p, i) => {
        const Cizim = SAHNELER[p.sahne];
        return (
          <Sequence key={i} from={f(p.bas)} durationInFrames={f(p.bit - p.bas) + GECIS}>
            <Kamera hareket={p.hareket} odak={p.odak}>
              {Cizim ? <Cizim t={frame / fps} olay={olay} /> : null}
            </Kamera>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 60%, rgba(50,24,8,0.45) 100%)'}} />
      {veri.vurgular.map((v, i) => (
        <Sequence key={`v${i}`} from={f(v.bas)} durationInFrames={f(v.sure)}>
          <Etiket satirlar={v.satirlar} />
        </Sequence>
      ))}
      <AltYazi kelimeler={veri.kelimeler} />
      <div style={{position: 'absolute', left: 64, top: 36, fontFamily: '"DejaVu Serif", serif', fontWeight: 700, fontSize: 30, color: 'rgba(255,240,210,0.9)', textShadow: '0 2px 6px rgba(60,30,10,0.6)'}}>
        Başka Bir Masalda
      </div>

      <Audio src={staticFile(veri.ses)} />
      {veri.muzik ? <Audio src={staticFile(veri.muzik)} volume={muzikSes} /> : null}
      {(veri.efektler ?? []).map((e, i) => (
        <Sequence key={`e${i}`} from={Math.max(f(e.bas), 0)}>
          <Audio src={staticFile(e.dosya)} volume={e.ses} />
        </Sequence>
      ))}
      {veri.gecis_sesi
        ? veri.planlar.slice(1).map((p, i) => (
            <Sequence key={`g${i}`} from={Math.max(f(p.bas - 0.15), 0)} durationInFrames={f(1.5)}>
              <Audio src={staticFile(veri.gecis_sesi!)} volume={0.18} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
