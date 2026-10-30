import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Masal, MasalVerisi} from './Masal';
import b05Pilot from './veri/b05_pilot.json';
import b05Animasyon from './veri/b05_animasyon.json';
import {KarakterSayfasi} from './cizim/KarakterSayfasi';
import {CizimMasal} from './CizimMasal';
import b05Cizim from './veri/b05_cizim.json';

const FPS = 30;

const kompozisyon = (id: string, veri: MasalVerisi) => (
  <Composition
    key={id}
    id={id}
    component={Masal}
    durationInFrames={Math.ceil(veri.sure * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{veri}}
  />
);

const Root: React.FC = () => (
  <>
    {kompozisyon('KarlarKralicesiDeneme', b05Pilot as MasalVerisi)}
    {kompozisyon('KarlarKralicesiAnimasyon', b05Animasyon as MasalVerisi)}
    <Composition
      id="KarlarKralicesiCizim"
      component={CizimMasal}
      durationInFrames={Math.ceil(b05Cizim.sure * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{veri: b05Cizim as unknown as MasalVerisi}}
    />
    <Composition id="KarakterSayfasi" component={KarakterSayfasi} durationInFrames={90} fps={FPS} width={1920} height={1080} />
  </>
);

registerRoot(Root);
