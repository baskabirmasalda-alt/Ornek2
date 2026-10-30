import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Andersen, Gerda, Kay, Kralice, RenGeyigi, Trol} from './Karakterler';

/** Kontrol için karakter sayfası (assets/b05/karakterler.png ile karşılaştırılır). */
export const KarakterSayfasi: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{backgroundColor: '#f3e6c4'}}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <Gerda x={330} y={1000} s={1.2} t={t} gul />
        <Kay x={620} y={1000} s={1.2} t={t} goz={0} />
        <Kralice x={980} y={1000} s={1.15} t={t} el />
        <Trol x={1340} y={1000} s={1.1} t={t} />
        <RenGeyigi x={1660} y={1000} s={1} t={t} sola />
        <Andersen x={1780} y={420} s={0.9} t={t} />
      </svg>
    </AbsoluteFill>
  );
};
