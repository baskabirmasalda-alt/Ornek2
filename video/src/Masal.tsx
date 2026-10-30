import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {AltYazi, Kelime} from './bilesenler/AltYazi';
import {Kar} from './bilesenler/Kar';
import {Hareket, Sahne} from './bilesenler/Sahne';
import {Renk, Vurgu} from './bilesenler/Vurgu';

export type MasalVerisi = {
  sure: number;
  ses: string;
  muzik: string | null;
  sahneler: string;
  planlar: {bas: number; bit: number; sahne: number; hareket?: Hareket; odak?: [number, number]}[];
  vurgular: {bas: number; sure: number; satirlar: {metin: string; renk: Renk}[]}[];
  kelimeler: Kelime[];
};

const GECIS = 8; // kare

const Gecisli: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, GECIS], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

/** Bir bölümü kurgu verisinden çizer: hareketli sahneler, vurgu yazıları, kar, karaoke alt yazı, ses ve müzik. */
export const Masal: React.FC<{veri: MasalVerisi}> = ({veri}) => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0d1a'}}>
      {veri.planlar.map((p, i) => (
        <Sequence key={i} from={f(p.bas)} durationInFrames={f(p.bit - p.bas) + GECIS}>
          <Gecisli>
            <Sahne gorsel={`${veri.sahneler}/s${String(p.sahne).padStart(2, '0')}.png`} hareket={p.hareket} odak={p.odak} />
          </Gecisli>
        </Sequence>
      ))}
      <Kar />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
      {veri.vurgular.map((v, i) => (
        <Sequence key={i} from={f(v.bas)} durationInFrames={f(v.sure)}>
          <Vurgu satirlar={v.satirlar} />
        </Sequence>
      ))}
      <AltYazi kelimeler={veri.kelimeler} />
      <div style={{position: 'absolute', left: 40, top: 32, fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 30, color: 'rgba(255,225,160,0.8)'}}>
        Başka Bir Masalda
      </div>
      <Audio src={staticFile(veri.ses)} />
      {veri.muzik ? <Audio src={staticFile(veri.muzik)} volume={0.14} /> : null}
    </AbsoluteFill>
  );
};
