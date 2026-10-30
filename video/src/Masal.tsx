import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {AltYazi, Kelime} from './bilesenler/AltYazi';
import {Buz, IsikHuzmesi, Kirilma, Kristaller, KuzeyIsiklari, MumIsigi} from './bilesenler/Efektler';
import {Kar} from './bilesenler/Kar';
import {Hareket, Sahne} from './bilesenler/Sahne';
import {Renk, Vurgu} from './bilesenler/Vurgu';

type Plan = {bas: number; bit: number; sahne: number; hareket?: Hareket; odak?: [number, number]};
type Animasyon = {tur: 'kirilma' | 'buz' | 'kristaller'; bas: number; sure: number; merkez?: [number, number]};

export type MasalVerisi = {
  sure: number;
  ses: string;
  muzik: string | null;
  sahneler: string;
  planlar: Plan[];
  vurgular: {bas: number; sure: number; satirlar: {metin: string; renk: Renk}[]}[];
  efektler?: {bas: number; dosya: string; ses: number}[];
  sessizlik?: {bas: number; sure: number}[];
  animasyonlar?: Animasyon[];
  gecis_sesi?: string | null;
  kelimeler: Kelime[];
};

// Sahneye özel kodla animasyon katmanları (görsel numarasına göre)
const KATMAN: Record<number, React.FC> = {
  1: () => <KuzeyIsiklari />,
  2: () => <MumIsigi x={0.89} y={0.56} />,
  6: () => <IsikHuzmesi />,
  9: () => <MumIsigi x={0.26} y={0.6} />,
};

const GECIS = 8; // kare

/** Kesmelerde kısa ışık patlaması + hafif bulanıklıkla açılış. */
const Gecisli: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, GECIS], [0, 1], {extrapolateRight: 'clamp'});
  const blur = interpolate(frame, [0, GECIS], [10, 0], {extrapolateRight: 'clamp'});
  const flas = interpolate(frame, [0, 3, GECIS + 4], [0, 0.35, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity}}>
      <AbsoluteFill style={{filter: `blur(${blur}px)`}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: 'white', opacity: flas, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

/** Bir bölümü kurgu verisinden çizer: hareketli sahneler, kodla efektler, vurgu yazıları, kar,
 *  karaoke alt yazı, anlatım, konuşmada kısılan ve sürprizden önce susan müzik, ses efektleri. */
export const Masal: React.FC<{veri: MasalVerisi}> = ({veri}) => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const sahneYolu = (n: number) => `${veri.sahneler}/s${String(n).padStart(2, '0')}.png`;

  const muzikSes = (kare: number) => {
    const t = kare / fps;
    const konusuyor = veri.kelimeler.some((k) => k.start - 0.15 <= t && t <= k.end + 0.25);
    let v = konusuyor ? 0.12 : 0.32;
    for (const s of veri.sessizlik ?? []) {
      if (t >= s.bas - s.sure && t < s.bas + 0.15) v *= 0.05;
      else if (t >= s.bas + 0.15 && t < s.bas + 0.6) v *= interpolate(t, [s.bas + 0.15, s.bas + 0.6], [0.05, 1]);
    }
    return v * interpolate(t, [veri.sure - 2, veri.sure], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#0b0d1a'}}>
      {veri.planlar.map((p, i) => {
        const Katman = KATMAN[p.sahne];
        return (
          <Sequence key={i} from={f(p.bas)} durationInFrames={f(p.bit - p.bas) + GECIS}>
            <Gecisli>
              <Sahne gorsel={sahneYolu(p.sahne)} hareket={p.hareket} odak={p.odak} />
              {Katman ? <Katman /> : null}
            </Gecisli>
          </Sequence>
        );
      })}
      {(veri.animasyonlar ?? []).map((a, i) => {
        const plan = [...veri.planlar].reverse().find((p) => p.bas <= a.bas) ?? veri.planlar[0];
        return (
          <Sequence key={`a${i}`} from={f(a.bas)} durationInFrames={f(a.sure)}>
            {a.tur === 'kirilma' ? <Kirilma gorsel={sahneYolu(plan.sahne)} odak={plan.odak} /> : null}
            {a.tur === 'buz' ? <Buz merkez={a.merkez} /> : null}
            {a.tur === 'kristaller' ? <Kristaller /> : null}
          </Sequence>
        );
      })}
      <Kar />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
      {veri.vurgular.map((v, i) => (
        <Sequence key={`v${i}`} from={f(v.bas)} durationInFrames={f(v.sure)}>
          <Vurgu satirlar={v.satirlar} />
        </Sequence>
      ))}
      <AltYazi kelimeler={veri.kelimeler} />
      <div style={{position: 'absolute', left: 40, top: 32, fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 30, color: 'rgba(255,225,160,0.8)'}}>
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
              <Audio src={staticFile(veri.gecis_sesi!)} volume={0.22} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
