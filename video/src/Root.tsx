import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Masal, MasalVerisi} from './Masal';
import b05Pilot from './veri/b05_pilot.json';

const FPS = 30;

const Root: React.FC = () => {
  const pilot = b05Pilot as MasalVerisi;
  return (
    <>
      <Composition
        id="KarlarKralicesiDeneme"
        component={Masal}
        durationInFrames={Math.ceil(pilot.sure * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{veri: pilot}}
      />
    </>
  );
};

registerRoot(Root);
