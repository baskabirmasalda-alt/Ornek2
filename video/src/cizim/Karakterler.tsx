import React from 'react';

// Karakterler kodla (SVG) çizilir; ayrıntılar assets/b05/karakterler.png ile aynı tutulur.
// Her karakterin yerel koordinatında ayak ortası (0, 0), yukarısı eksi y.

export const kirpma = (t: number, kay = 0) => ((t + kay) % 3.9 < 0.13 ? 0.1 : 1);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

const Goz: React.FC<{x: number; y: number; r?: number; iris: string; acik: number; kas?: string}> = ({x, y, r = 7, iris, acik, kas = '#3a2418'}) =>
  acik < 0.5 ? (
    <path d={`M ${x - r} ${y} Q ${x} ${y + r * 0.6} ${x + r} ${y}`} stroke={kas} strokeWidth={r * 0.35} fill="none" strokeLinecap="round" />
  ) : (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx={r} ry={r * 0.82} fill="#fbf8f3" />
      <circle r={r * 0.66} fill={iris} />
      <circle r={r * 0.32} fill="#1c1716" />
      <circle cx={r * 0.25} cy={-r * 0.25} r={r * 0.18} fill="#fff" />
      <path d={`M ${-r * 1.15} ${-r * 0.25} Q 0 ${-r * 1.2} ${r * 1.15} ${-r * 0.25}`} stroke={kas} strokeWidth={r * 0.3} fill="none" strokeLinecap="round" />
    </g>
  );

/** Küçük kırmızı gül (bahçe ve Gerda'nın elindeki). */
export const Gul: React.FC<{x: number; y: number; s?: number; d?: number}> = ({x, y, s = 1, d = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${d}) scale(${s})`}>
    <path d="M -4 -20 C -30 -28 -34 -8 -26 0 C -18 -6 -10 -12 -4 -20 Z" fill="#4c7a3c" />
    <path d="M 4 -18 C 30 -22 32 0 22 6 C 16 -2 10 -10 4 -18 Z" fill="#5b8a46" />
    <circle cy={-30} r={17} fill="#b81c27" />
    <path d="M -15 -32 C -10 -48 10 -48 15 -32 C 8 -40 -8 -40 -15 -32 Z" fill="#d93a42" />
    <path d="M -9 -30 C -6 -40 6 -40 9 -30 C 5 -24 -5 -24 -9 -30 Z" fill="#8e1420" />
    <path d="M -4 -32 Q 0 -37 4 -32" stroke="#e8585e" strokeWidth={2} fill="none" />
    <path d="M -16 -24 Q 0 -12 16 -24" stroke="#9a1622" strokeWidth={2} fill="none" />
  </g>
);

/** Gerda: kestane uzun saç, gri-leylak kurdele, al yanaklar, hardal örgü elbise ve beyaz yaka,
 *  çiçek işlemeli krem önlük, kırmızı kolye, kırmızı çizmeler. */
export const Gerda: React.FC<{x: number; y: number; s?: number; t: number; yuru?: boolean; gul?: boolean}> = ({x, y, s = 1, t, yuru, gul}) => {
  const adim = yuru ? Math.sin(t * 5.2) : 0;
  const bob = yuru ? -Math.abs(Math.sin(t * 5.2)) * 6 : Math.sin(t * 2.1) * 1.2;
  const sac = Math.sin(t * 1.4) * 1.4 + (yuru ? adim * 1.2 : 0);
  const acik = kirpma(t, 0.7);
  const Cizme = ({ayna}: {ayna?: boolean}) => (
    <g transform={ayna ? 'scale(-1 1)' : undefined}>
      <rect x={-36} y={-128} width={22} height={60} fill="#6b6470" />
      <path d="M -44 -80 L -10 -80 L -9 -10 Q -9 0 -20 0 L -52 0 Q -61 -1 -56 -13 L -45 -32 Z" fill="#cf2c28" />
      <path d="M -40 -70 L -38 -36" stroke="#ec6a5c" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      <rect x={-46} y={-90} width={38} height={15} rx={4} fill="#b0221e" />
      {[-40, -33, -26, -19, -12].map((k) => (
        <line key={k} x1={k} y1={-89} x2={k} y2={-76} stroke="#8e1a17" strokeWidth={1.5} />
      ))}
    </g>
  );
  const Kol = ({ayna}: {ayna?: boolean}) => (
    <g transform={ayna ? 'scale(-1 1)' : undefined}>
      <path d="M -40 -370 C -74 -362 -88 -300 -91 -230 L -66 -225 C -62 -290 -56 -322 -44 -334 Z" fill="#dfa428" />
      <path d="M -62 -350 C -76 -320 -82 -280 -84 -236" stroke="#c48a19" strokeWidth={5} fill="none" opacity={0.6} />
      <ellipse cx={-78} cy={-227} rx={14} ry={6} fill="#c79020" />
      <circle cx={-79} cy={-213} r={11} fill="#f4cdb4" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + bob * s}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={96} ry={13} fill="#5a3a1c" opacity={0.18} />
      <g transform={`rotate(${sac} 0 -480)`}>
        <path d="M -46 -500 C -98 -470 -96 -380 -86 -300 C -82 -272 -62 -266 -50 -292 L 50 -292 C 62 -266 82 -272 86 -300 C 96 -380 98 -470 46 -500 Z" fill="#743b20" />
      </g>
      <g transform={`translate(0 ${-Math.max(0, adim) * 10})`}>
        <Cizme />
      </g>
      <g transform={`translate(0 ${-Math.max(0, -adim) * 10})`}>
        <Cizme ayna />
      </g>
      {/* elbise */}
      <path d="M -40 -372 Q 0 -382 40 -372 L 58 -300 L 102 -112 Q 0 -96 -102 -112 L -58 -300 Z" fill="#e1a72a" />
      {Array.from({length: 17}, (_, i) => -96 + i * 12).map((k) => (
        <line key={k} x1={k * 0.45} y1={-368} x2={k} y2={-110} stroke="#c58c18" strokeWidth={1.4} opacity={0.45} />
      ))}
      <path d="M 30 -370 L 58 -300 L 102 -112 Q 82 -107 62 -105 L 42 -300 Z" fill="#b98018" opacity={0.35} />
      <Kol />
      {gul ? (
        <g>
          <Kol ayna />
          <line x1={79} y1={-212} x2={74} y2={-280} stroke="#4c7a3c" strokeWidth={3} />
          <Gul x={74} y={-262} s={0.75} />
          <circle cx={79} cy={-213} r={11} fill="#f4cdb4" />
        </g>
      ) : (
        <Kol ayna />
      )}
      {/* önlük */}
      <path d="M -44 -300 L 44 -300 L 62 -142 Q 0 -132 -62 -142 Z" fill="#eedfc0" stroke="#d6c39e" strokeWidth={2} />
      <path d="M -20 -296 Q -24 -230 -30 -150 M 22 -296 Q 26 -230 32 -150" stroke="#dccaa6" strokeWidth={3} fill="none" />
      <rect x={-47} y={-306} width={94} height={9} rx={3} fill="#e4d2ae" />
      <path d="M -57 -186 L 57 -186 L 61 -152 Q 0 -146 -61 -152 Z" fill="#f6eddb" stroke="#c44c3c" strokeWidth={2} />
      {[-44, -22, 0, 22, 44].map((k) => (
        <g key={k}>
          <ellipse cx={k - 8} cy={-166} rx={6} ry={2.6} fill="#5f8a4a" transform={`rotate(-25 ${k - 8} -166)`} />
          <ellipse cx={k + 8} cy={-166} rx={6} ry={2.6} fill="#5f8a4a" transform={`rotate(25 ${k + 8} -166)`} />
          <circle cx={k} cy={-169} r={5} fill="#c73838" />
          <circle cx={k} cy={-169} r={2} fill="#e8b54a" />
        </g>
      ))}
      {/* yaka, kolye, boyun */}
      <rect x={-11} y={-404} width={22} height={36} fill="#efc6ab" />
      <ellipse cx={-14} cy={-370} rx={19} ry={9} fill="#fbf6ec" stroke="#ddd2c0" strokeWidth={1.5} />
      <ellipse cx={14} cy={-370} rx={19} ry={9} fill="#fbf6ec" stroke="#ddd2c0" strokeWidth={1.5} />
      <line x1={0} y1={-362} x2={0} y2={-349} stroke="#7a3e21" strokeWidth={1.5} />
      <circle cx={0} cy={-345} r={4.5} fill="#c8323a" />
      {/* baş */}
      <ellipse cx={0} cy={-442} rx={46} ry={52} fill="#f7d6bf" />
      <circle cx={-27} cy={-423} r={12} fill="#ef8f84" opacity={0.5} />
      <circle cx={27} cy={-423} r={12} fill="#ef8f84" opacity={0.5} />
      <Goz x={-17} y={-442} r={7.5} iris="#7b9176" acik={acik} />
      <Goz x={17} y={-442} r={7.5} iris="#7b9176" acik={acik} />
      <path d="M -27 -459 Q -17 -465 -8 -459 M 8 -459 Q 17 -465 27 -459" stroke="#6e3a22" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d="M -2 -432 Q 4 -425 -1 -421" stroke="#d69c84" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M -9 -409 Q 0 -403 9 -409" stroke="#bf5059" strokeWidth={2.8} fill="none" strokeLinecap="round" />
      {/* ön saç */}
      <g transform={`rotate(${sac * 0.6} 0 -470)`}>
        <path d="M -50 -440 C -58 -505 -20 -512 0 -500 C 20 -512 58 -505 50 -440 C 42 -470 22 -482 2 -484 L -2 -484 C -22 -482 -42 -470 -50 -440 Z" fill="#87452a" />
        <path d="M -50 -452 C -62 -410 -60 -360 -73 -316 C -62 -320 -54 -330 -50 -346 C -44 -382 -40 -420 -40 -454 Z" fill="#87452a" />
        <path d="M 50 -452 C 62 -410 60 -360 73 -316 C 62 -320 54 -330 50 -346 C 44 -382 40 -420 40 -454 Z" fill="#87452a" />
        <path d="M -12 -498 C -30 -494 -42 -476 -46 -452 M 12 -498 C 30 -494 42 -476 46 -452 M -52 -420 C -56 -380 -60 -350 -66 -326" stroke="#a75c35" strokeWidth={3} fill="none" opacity={0.75} />
        {/* kurdele */}
        <g transform="translate(-40 -482) rotate(-20)">
          <path d="M 0 0 C -20 -18 -32 -4 -20 7 Z" fill="#8c8697" stroke="#6d6879" strokeWidth={1.5} />
          <path d="M 0 0 C 16 -19 30 -6 19 7 Z" fill="#8c8697" stroke="#6d6879" strokeWidth={1.5} />
          <path d="M -1 2 L -10 26 M 1 2 L 7 27" stroke="#8c8697" strokeWidth={4} strokeLinecap="round" />
          <circle r={4.5} fill="#77728a" />
        </g>
      </g>
    </g>
  );
};

/** Kay: kül sarısı dağınık saç, mavi gözler, çiller, gri örgü atkı, lacivert palto, koyu gri pantolon, siyah çizmeler.
 *  goz: 0–1 elini gözüne götürme, buz: 0–1 göğsünde yayılan buz. */
export const Kay: React.FC<{x: number; y: number; s?: number; t: number; goz?: number; buz?: number}> = ({x, y, s = 1, t, goz = 0, buz = 0}) => {
  const acik = goz > 0.6 ? 0.1 : kirpma(t, 2.1);
  const ovus = goz > 0.6 ? Math.sin(t * 13) * 4 : 0;
  const dirsek: [number, number] = [lerp(-84, -92, goz), lerp(-330, -400, goz)];
  const el: [number, number] = [lerp(-80, -20, goz) + ovus, lerp(-236, -508, goz)];
  const Bacak = ({ayna}: {ayna?: boolean}) => (
    <g transform={ayna ? 'scale(-1 1)' : undefined}>
      <path d="M -42 -250 L -6 -250 L -9 -82 L -37 -82 Z" fill="#4a4c55" />
      <path d="M -41 -96 L -8 -96 L -6 -8 Q -6 0 -17 0 L -50 0 Q -60 -1 -53 -13 L -42 -40 Z" fill="#1e1e24" />
      <path d="M -36 -86 L -35 -40" stroke="#4a4a55" strokeWidth={3} opacity={0.7} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + Math.sin(t * 2 + 1) * 1.2 * s}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={92} ry={13} fill="#5a3a1c" opacity={0.18} />
      <Bacak />
      <Bacak ayna />
      {/* palto */}
      <path d="M -54 -432 C -20 -440 20 -440 54 -432 L 82 -205 Q 0 -194 -82 -205 Z" fill="#22315b" />
      <path d="M 30 -434 L 54 -432 L 82 -205 Q 66 -200 54 -199 Z" fill="#16213f" opacity={0.6} />
      <path d="M 0 -420 L 2 -198" stroke="#18233f" strokeWidth={3} />
      <path d="M -30 -432 L -8 -388 L -22 -350 L -2 -330 M 30 -432 L 10 -388 L 24 -350 L 4 -330" stroke="#18233f" strokeWidth={4} fill="none" strokeLinejoin="round" />
      {[-372, -326, -280].map((k) => (
        <g key={k}>
          <circle cx={-19} cy={k} r={5} fill="#33333c" stroke="#5c6176" strokeWidth={1.5} />
          <circle cx={19} cy={k} r={5} fill="#33333c" stroke="#5c6176" strokeWidth={1.5} />
        </g>
      ))}
      <path d="M -66 -262 L -32 -264 M 34 -264 L 68 -262" stroke="#18233f" strokeWidth={4} strokeLinecap="round" />
      {buz > 0 ? (
        <g opacity={Math.min(1, buz * 1.4)}>
          <ellipse cx={-6} cy={-372} rx={20 + 55 * buz} ry={16 + 45 * buz} fill="#e2f2f3" opacity={0.55} />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <g key={a} transform={`translate(-6 -372) rotate(${a}) scale(${0.3 + 0.7 * buz})`}>
              <path d="M 0 0 L 0 -62 M 0 -20 L -12 -32 M 0 -20 L 12 -32 M 0 -40 L -10 -50 M 0 -40 L 10 -50" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" fill="none" />
            </g>
          ))}
        </g>
      ) : null}
      {/* sol kol (izleyenin sağı) */}
      <path d="M 52 -428 C 78 -418 90 -340 92 -250 L 68 -246 C 66 -320 60 -370 48 -390 Z" fill="#22315b" />
      <circle cx={80} cy={-236} r={12} fill="#f2cbb2" />
      {/* boyun, atkı */}
      <rect x={-12} y={-472} width={24} height={34} fill="#efc7ad" />
      <path d="M -10 -432 L 14 -430 L 10 -342 L -14 -346 Z" fill="#828388" />
      <path d="M 6 -434 L 32 -434 L 36 -318 L 10 -320 Z" fill="#8e8f94" />
      {[-410, -392, -374, -356, -338].map((k) => (
        <line key={k} x1={9} y1={k} x2={34} y2={k} stroke="#707176" strokeWidth={2} />
      ))}
      {[12, 18, 24, 30].map((k) => (
        <line key={k} x1={k} y1={-320} x2={k + 1} y2={-306} stroke="#8e8f94" strokeWidth={3} strokeLinecap="round" />
      ))}
      <path d="M -40 -456 Q 0 -436 40 -456 L 44 -428 Q 0 -404 -44 -428 Z" fill="#94959a" />
      {[-30, -18, -6, 6, 18, 30].map((k) => (
        <path key={k} d={`M ${k} ${-448 + Math.abs(k) * 0.2} L ${k + 1} ${-420 + Math.abs(k) * 0.2}`} stroke="#77787d" strokeWidth={2} />
      ))}
      {/* baş */}
      <ellipse cx={-46} cy={-508} rx={8} ry={12} fill="#efc5aa" />
      <ellipse cx={46} cy={-508} rx={8} ry={12} fill="#efc5aa" />
      <ellipse cx={0} cy={-512} rx={47} ry={53} fill="#f5d2ba" />
      <Goz x={-17} y={-512} r={7.5} iris="#4c86c8" acik={acik} kas="#6e6248" />
      <Goz x={17} y={-512} r={7.5} iris="#4c86c8" acik={acik} kas="#6e6248" />
      <path d="M -27 -529 Q -17 -534 -8 -529 M 8 -529 Q 17 -534 27 -529" stroke="#8a7a55" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      {[[-30, -494], [-24, -489], [-19, -496], [-12, -490], [12, -490], [19, -496], [24, -489], [30, -494], [-5, -497], [5, -497]].map(([a, b], i) => (
        <circle key={i} cx={a} cy={b} r={1.7} fill="#c48461" />
      ))}
      <path d="M -2 -502 Q 4 -494 -1 -490" stroke="#d49a82" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M -8 -476 Q 0 -473 8 -476" stroke="#b85a5c" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      {/* saç */}
      <path d="M -50 -500 C -62 -562 -22 -582 10 -574 C 42 -578 64 -548 52 -500 L 46 -522 L 38 -508 L 30 -532 L 18 -516 L 8 -536 L -4 -516 L -16 -534 L -26 -512 L -36 -528 L -42 -506 Z" fill="#b6a880" />
      <path d="M -24 -570 L -36 -592 L -10 -578 Z M 6 -575 L 16 -598 L 26 -573 Z M 34 -566 L 52 -580 L 46 -556 Z" fill="#b6a880" />
      <path d="M -40 -540 C -30 -560 -10 -568 6 -566 M 14 -560 C 30 -560 44 -548 48 -530" stroke="#958862" strokeWidth={3} fill="none" />
      {/* sağ kol: el göze */}
      <path d={`M -48 -420 L ${dirsek[0]} ${dirsek[1]} L ${el[0]} ${el[1] + 16}`} stroke="#22315b" strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={el[0]} cy={el[1]} r={13} fill="#f2cbb2" />
    </g>
  );
};

const KarTanesi: React.FC<{x: number; y: number; r: number; renk?: string}> = ({x, y, r, renk = '#a9b7c6'}) => (
  <g transform={`translate(${x} ${y})`} stroke={renk} strokeWidth={2} strokeLinecap="round" fill="none">
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <path d={`M 0 0 L 0 ${-r} M 0 ${-r * 0.55} L ${-r * 0.25} ${-r * 0.75} M 0 ${-r * 0.55} L ${r * 0.25} ${-r * 0.75}`} />
      </g>
    ))}
  </g>
);

const Yaprak: React.FC<{x: number; y: number; s?: number; d?: number}> = ({x, y, s = 1, d = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${d}) scale(${s})`} fill="#b3c0cd">
    <path d="M 0 0 C -2 -40 2 -80 0 -110" stroke="#a5b3c2" strokeWidth={2.5} fill="none" />
    {[-20, -40, -60, -80, -98].map((k, i) => (
      <g key={k}>
        <ellipse cx={-9} cy={k} rx={10 - i} ry={3.5} transform={`rotate(-35 -9 ${k})`} />
        <ellipse cx={9} cy={k - 5} rx={10 - i} ry={3.5} transform={`rotate(35 9 ${k - 5})`} />
      </g>
    ))}
  </g>
);

/** Karlar Kraliçesi: gümüş-beyaz uzun saç, buz kristali taç, beyaz kürk pelerin (gümüş kar tanesi ve yaprak işlemeleri),
 *  açık mavi elbise, mavi broş, solgun ten, mavi gözler. */
export const Kralice: React.FC<{x: number; y: number; s?: number; t: number; el?: boolean}> = ({x, y, s = 1, t, el}) => {
  const acik = kirpma(t, 1.3);
  const sac = Math.sin(t * 1.1) * 1.2;
  const parilti = ((t * 0.45) % 1.6) - 0.3; // taçta kayan ışık
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={230} ry={18} fill="#5a3a1c" opacity={0.15} />
      <path d="M -95 -585 C -150 -400 -190 -150 -218 0 Q 0 24 218 0 C 190 -150 150 -400 95 -585 Z" fill="#ecedea" />
      <g transform={`rotate(${sac} 0 -690)`}>
        <path d="M -40 -700 C -86 -660 -96 -560 -90 -420 C -72 -398 -56 -418 -50 -440 L 50 -440 C 56 -418 72 -398 90 -420 C 96 -560 86 -660 40 -700 Z" fill="#e6e9ed" />
      </g>
      <path d="M -38 -575 L 38 -575 C 48 -380 58 -180 66 0 L -66 0 C -58 -180 -48 -380 -38 -575 Z" fill="#a7d3ee" />
      <path d="M 14 -560 C 24 -380 34 -180 42 0 L 66 0 C 58 -180 48 -380 38 -575 Z" fill="#8cbfe0" opacity={0.7} />
      {Array.from({length: 14}, (_, i) => -555 + i * 10).map((k) => (
        <circle key={k} cx={0} cy={k} r={2} fill="#eef8ff" />
      ))}
      <path d="M -34 -470 Q 0 -455 34 -470" stroke="#dff1fb" strokeWidth={3} fill="none" />
      {/* pelerin önleri */}
      <path d="M -95 -585 C -112 -400 -135 -200 -168 0 L -70 0 C -60 -200 -52 -400 -40 -572 Z" fill="#f6f6f3" />
      <path d="M 95 -585 C 112 -400 135 -200 168 0 L 70 0 C 60 -200 52 -400 40 -572 Z" fill="#f6f6f3" />
      <path d="M -82 -450 C -96 -300 -112 -150 -128 0 M -150 -250 C -165 -150 -180 -80 -196 0 M 82 -450 C 96 -300 112 -150 128 0 M 150 -250 C 165 -150 180 -80 196 0" stroke="#d9dde1" strokeWidth={6} fill="none" opacity={0.8} />
      <path d="M -42 -570 C -54 -400 -62 -200 -70 0 M 42 -570 C 54 -400 62 -200 70 0" stroke="#fdfdfb" strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d="M -30 -570 C -42 -400 -50 -200 -58 0 M 30 -570 C 42 -400 50 -200 58 0" stroke="#d6dade" strokeWidth={4} fill="none" opacity={0.8} />
      {Array.from({length: 22}, (_, i) => i / 21).map((u) => (
        <g key={u}>
          <circle cx={-42 - 28 * u - 12} cy={-570 + 570 * u} r={7} fill="#fdfdfb" />
          <circle cx={42 + 28 * u + 12} cy={-570 + 570 * u} r={7} fill="#fdfdfb" />
        </g>
      ))}
      <path d="M -218 0 Q 0 24 218 0" stroke="#fdfdfb" strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d="M -210 -10 Q 0 12 210 -10" stroke="#dadee2" strokeWidth={3} fill="none" opacity={0.8} />
      <KarTanesi x={-120} y={-170} r={24} />
      <KarTanesi x={122} y={-175} r={24} />
      <KarTanesi x={-96} y={-390} r={17} />
      <KarTanesi x={100} y={-400} r={17} />
      <KarTanesi x={-150} y={-60} r={14} />
      <KarTanesi x={150} y={-60} r={14} />
      <Yaprak x={-108} y={-230} d={-8} s={0.9} />
      <Yaprak x={110} y={-235} d={8} s={0.9} />
      <Yaprak x={-140} y={-20} d={-12} s={0.8} />
      <Yaprak x={142} y={-20} d={12} s={0.8} />
      {/* kürk yaka */}
      {[[-74, -582, 48, 30], [74, -582, 48, 30], [-42, -600, 40, 26], [42, -600, 40, 26], [-100, -560, 30, 24], [100, -560, 30, 24]].map(([a, b, c, d], i) => (
        <ellipse key={i} cx={a} cy={b} rx={c} ry={d} fill="#fbfbf9" stroke="#e1e4e7" strokeWidth={2} />
      ))}
      <path d="M 0 -578 L 13 -560 L 0 -540 L -13 -560 Z" fill="#62ade2" stroke="#eaf6ff" strokeWidth={2} />
      {el ? (
        <g>
          <path d="M 96 -500 C 130 -470 150 -440 176 -430" stroke="#f4f4f1" strokeWidth={34} strokeLinecap="round" fill="none" />
          <ellipse cx={192} cy={-436} rx={20} ry={9} fill="#f6e3dc" transform="rotate(-12 192 -436)" />
          <path d="M 176 -442 Q 192 -452 210 -444" stroke="#e8cfc6" strokeWidth={2} fill="none" />
        </g>
      ) : null}
      {/* baş */}
      <rect x={-10} y={-626} width={20} height={40} fill="#f3dfd7" />
      <ellipse cx={0} cy={-662} rx={40} ry={48} fill="#f8e9e3" />
      <circle cx={-22} cy={-646} r={9} fill="#f1c2c2" opacity={0.35} />
      <circle cx={22} cy={-646} r={9} fill="#f1c2c2" opacity={0.35} />
      <Goz x={-15} y={-664} r={6.5} iris="#78b0da" acik={acik} kas="#9aa3ad" />
      <Goz x={15} y={-664} r={6.5} iris="#78b0da" acik={acik} kas="#9aa3ad" />
      <path d="M -23 -679 Q -15 -683 -7 -679 M 7 -679 Q 15 -683 23 -679" stroke="#b9c0c8" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M -1 -656 Q 3 -650 -1 -646" stroke="#dfb6ad" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M -7 -633 Q 0 -629 7 -633" stroke="#d48f99" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <g transform={`rotate(${sac * 0.7} 0 -690)`}>
        <path d="M -42 -660 C -46 -712 -10 -720 0 -712 C 10 -720 46 -712 42 -660 C 36 -690 18 -700 0 -698 C -18 -700 -36 -690 -42 -660 Z" fill="#eef0f3" />
        <path d="M -42 -672 C -56 -600 -50 -520 -64 -436 L -46 -444 C -38 -520 -34 -600 -32 -668 Z" fill="#eef0f3" />
        <path d="M 42 -672 C 56 -600 50 -520 64 -436 L 46 -444 C 38 -520 34 -600 32 -668 Z" fill="#eef0f3" />
        <path d="M -48 -600 C -50 -540 -52 -490 -58 -446 M 48 -600 C 50 -540 52 -490 58 -446 M -20 -708 C -32 -702 -40 -690 -42 -672" stroke="#c6cdd6" strokeWidth={2} fill="none" />
      </g>
      {/* taç */}
      <g>
        <ellipse cx={0} cy={-704} rx={40} ry={7} fill="#cfe6f6" stroke="#8fb6d6" strokeWidth={1.5} />
        {[
          [0, 70, 9], [-18, 46, 8], [18, 46, 8], [-33, 30, 7], [33, 30, 7],
        ].map(([cx, h, w], i) => (
          <path key={i} d={`M ${cx - w} -706 L ${cx} ${-706 - h} L ${cx + w} -706 Z`} fill="#dcf0fc" stroke="#8fb6d6" strokeWidth={1.5} strokeLinejoin="round" />
        ))}
        <path d="M 0 -770 L 0 -712 M -18 -748 L -18 -712 M 18 -748 L 18 -712" stroke="#ffffff" strokeWidth={1.5} opacity={0.9} />
        <rect x={-46 + parilti * 92} y={-780} width={8} height={80} fill="#ffffff" opacity={parilti > 0 && parilti < 1 ? 0.65 : 0} transform={`skewX(-20)`} />
      </g>
    </g>
  );
};

/** Gümüş, süslü el aynası. Sapın ucu (0,0), cam merkezi (0,-150). icerik: camda görünen. */
export const ElAynasi: React.FC<{id: string; icerik?: React.ReactNode}> = ({id, icerik}) => (
  <g>
    <path d="M -7 -70 L -9 -8 Q 0 6 9 -8 L 7 -70 Z" fill="#b9bfc5" stroke="#7f868e" strokeWidth={2} />
    <circle cx={0} cy={-40} r={7} fill="#cfd3d8" stroke="#7f868e" strokeWidth={1.5} />
    <ellipse cx={0} cy={-150} rx={60} ry={80} fill="#c9ced3" stroke="#858b93" strokeWidth={4} />
    {Array.from({length: 18}, (_, i) => (i / 18) * Math.PI * 2).map((a, i) => (
      <circle key={i} cx={Math.cos(a) * 64} cy={-150 + Math.sin(a) * 84} r={6} fill="#d9dde1" stroke="#858b93" strokeWidth={1.5} />
    ))}
    <path d="M -16 -236 Q 0 -256 16 -236 Q 0 -244 -16 -236 Z" fill="#d9dde1" stroke="#858b93" strokeWidth={1.5} />
    <defs>
      <clipPath id={`cam-${id}`}>
        <ellipse cx={0} cy={-150} rx={47} ry={66} />
      </clipPath>
    </defs>
    <ellipse cx={0} cy={-150} rx={47} ry={66} fill="#dfe6e8" />
    <g clipPath={`url(#cam-${id})`}>{icerik}</g>
    <path d="M -30 -190 Q -20 -205 -5 -210" stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.7} strokeLinecap="round" />
  </g>
);

/** Aynadaki çirkin görüntü: solmuş, gri çiçekler. */
export const SolukCicek: React.FC = () => (
  <g>
    <rect x={-60} y={-230} width={120} height={160} fill="#a8aaa6" />
    <path d="M -16 -110 L 16 -110 L 12 -84 L -12 -84 Z" fill="#6f706c" />
    <path d="M -6 -110 C -12 -140 -26 -150 -32 -136 M 0 -110 C 2 -150 -4 -170 8 -176 M 6 -110 C 16 -136 30 -140 30 -124" stroke="#5f625c" strokeWidth={2.5} fill="none" />
    <ellipse cx={-32} cy={-132} rx={8} ry={5} fill="#7b7a72" transform="rotate(40 -32 -132)" />
    <ellipse cx={8} cy={-172} rx={8} ry={5} fill="#7b7a72" transform="rotate(70 8 -172)" />
    <ellipse cx={31} cy={-120} rx={8} ry={5} fill="#7b7a72" transform="rotate(110 31 -120)" />
  </g>
);

/** Trol: yamalı yeşil külah, sivri kulaklar, kocaman kırmızı burun, gri kirli sakal, sırıtış, yeşilimsi-gri ceket,
 *  kırmızı şort, kahverengi çizme; elinde gümüş el aynası. */
export const Trol: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => {
  const salla = Math.sin(t * 2.6) * 3;
  const bas = Math.sin(t * 2.6 + 0.6) * 1.5;
  const acik = kirpma(t, 0.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={80} ry={11} fill="#3a2410" opacity={0.25} />
      <rect x={-34} y={-58} width={20} height={22} fill="#7d7468" />
      <rect x={14} y={-58} width={20} height={22} fill="#7d7468" />
      <path d="M -40 -40 L -12 -40 L -10 -6 Q -10 0 -18 0 L -58 0 Q -66 -2 -60 -12 Z" fill="#7b5434" />
      <path d="M 12 -40 L 40 -40 L 58 -12 Q 64 -2 56 0 L 18 0 Q 10 0 10 -6 Z" fill="#7b5434" />
      <path d="M -44 -112 L 44 -112 L 47 -55 L 8 -50 L 0 -72 L -8 -50 L -47 -55 Z" fill="#a33b2e" />
      <path d="M -46 -206 C -20 -213 20 -213 46 -206 L 57 -100 L 30 -92 L 14 -104 L 0 -94 L -14 -104 L -30 -92 L -57 -100 Z" fill="#405c63" />
      <path d="M 26 -206 L 46 -206 L 57 -100 L 34 -95 Z" fill="#2f454b" opacity={0.6} />
      <rect x={-50} y={-134} width={100} height={11} fill="#6e4a2a" />
      <rect x={-8} y={-136} width={16} height={15} fill="none" stroke="#d9b04a" strokeWidth={3} />
      <circle cx={0} cy={-180} r={4} fill="#d9b04a" />
      <circle cx={0} cy={-158} r={4} fill="#d9b04a" />
      {/* sağ kol */}
      <path d="M 44 -196 C 64 -180 70 -150 66 -120" stroke="#405c63" strokeWidth={24} strokeLinecap="round" fill="none" />
      <circle cx={66} cy={-112} r={12} fill="#e6b496" />
      {/* sol kol + ayna */}
      <path d="M -42 -196 L -92 -150 L -124 -176" stroke="#405c63" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <g transform={`translate(-128 -178) rotate(${-24 + salla})`}>
        <ElAynasi id="trol" icerik={<SolukCicek />} />
      </g>
      <circle cx={-128} cy={-178} r={13} fill="#e6b496" />
      {/* baş */}
      <g transform={`rotate(${bas} 0 -230)`}>
        <path d="M -48 -272 L -124 -306 L -54 -236 Z" fill="#e6b496" />
        <path d="M -56 -266 L -108 -294 L -58 -246 Z" fill="#e9978a" />
        <path d="M 48 -272 L 124 -306 L 54 -236 Z" fill="#e6b496" />
        <path d="M 56 -266 L 108 -294 L 58 -246 Z" fill="#e9978a" />
        <ellipse cx={0} cy={-262} rx={56} ry={53} fill="#e6b496" />
        <path d="M -46 -240 C -42 -196 42 -196 46 -240 C 30 -214 -30 -214 -46 -240 Z" fill="#a9a49b" opacity={0.85} />
        {[-36, -26, -16, 16, 26, 36].map((k) => (
          <line key={k} x1={k} y1={-226 + Math.abs(k) * 0.3} x2={k * 1.05} y2={-214 + Math.abs(k) * 0.25} stroke="#8c877e" strokeWidth={1.5} />
        ))}
        <path d="M -30 -224 Q 0 -194 30 -224 Q 0 -214 -30 -224 Z" fill="#6b2525" />
        <path d="M -24 -222 L 24 -222 L 22 -215 L -22 -215 Z" fill="#fbf6ea" />
        <Goz x={-20} y={-272} r={5.5} iris="#5a4632" acik={acik} kas="#7d746a" />
        <Goz x={20} y={-272} r={5.5} iris="#5a4632" acik={acik} kas="#7d746a" />
        <path d="M -32 -284 Q -20 -292 -8 -284 M 8 -284 Q 20 -292 32 -284" stroke="#9a948c" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M -38 -262 Q -32 -256 -26 -260 M 38 -262 Q 32 -256 26 -260" stroke="#c8906f" strokeWidth={1.8} fill="none" />
        <ellipse cx={0} cy={-248} rx={20} ry={16} fill="#e47a62" />
        <ellipse cx={-6} cy={-254} rx={6} ry={4} fill="#f2a08c" />
        {/* külah */}
        <path d="M -58 -280 C -60 -342 -4 -372 30 -362 C 60 -352 72 -330 92 -300 L 72 -304 C 62 -300 58 -292 58 -280 Z" fill="#5c8e3c" />
        <path d="M -60 -284 Q 0 -300 60 -284 L 60 -274 Q 0 -290 -60 -274 Z" fill="#4c7a30" />
        <rect x={-40} y={-338} width={28} height={22} fill="#b07a45" transform="rotate(-10 -26 -327)" stroke="#5a3d20" strokeWidth={1.5} strokeDasharray="4 3" />
        <rect x={8} y={-352} width={22} height={19} fill="#8f6a3c" transform="rotate(12 19 -342)" stroke="#5a3d20" strokeWidth={1.5} strokeDasharray="4 3" />
        <path d="M 40 -322 L 52 -312 M 46 -326 L 42 -308" stroke="#3a5a24" strokeWidth={2} />
      </g>
    </g>
  );
};

/** Ren geyiği (yandan, sağa bakar): kahverengi, açık karın, beyaz benekler, boynuzlar, kırmızı koşum, altın çanlar. */
export const RenGeyigi: React.FC<{x: number; y: number; s?: number; t: number; yuru?: boolean; sola?: boolean}> = ({x, y, s = 1, t, yuru, sola}) => {
  const f = yuru ? t * 5.2 : 0;
  const ac = (k: number) => (yuru ? Math.sin(f + k) * 16 : 0);
  const Bacak = ({bx, k, koyu}: {bx: number; k: number; koyu?: boolean}) => (
    <g transform={`rotate(${ac(k)} ${bx} -150)`}>
      <path d={`M ${bx - 9} -160 L ${bx + 9} -160 L ${bx + 5} -60 L ${bx + 4} -10 L ${bx - 3} -10 L ${bx - 5} -60 Z`} fill={koyu ? '#6f4329' : '#7e4d30'} />
      <path d={`M ${bx - 4} -12 L ${bx + 6} -12 L ${bx + 7} 0 L ${bx - 5} 0 Z`} fill="#2e221b" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + (yuru ? -Math.abs(Math.sin(f)) * 4 : 0) * s}) scale(${sola ? -s : s} ${s})`}>
      <ellipse cx={20} cy={2} rx={140} ry={12} fill="#5a3a1c" opacity={0.18} />
      <Bacak bx={-82} k={Math.PI} koyu />
      <Bacak bx={72} k={0} koyu />
      <path d="M -112 -198 C -122 -210 -120 -222 -106 -214 Z" fill="#f1e6d4" />
      <ellipse cx={0} cy={-178} rx={116} ry={56} fill="#8b5839" />
      <ellipse cx={0} cy={-148} rx={92} ry={24} fill="#b88b63" />
      {[[-60, -200], [-30, -214], [0, -206], [30, -216], [-80, -176], [-45, -186], [15, -190], [50, -200], [-15, -224]].map(([a, b], i) => (
        <ellipse key={i} cx={a} cy={b} rx={6} ry={4.5} fill="#f1e6d6" opacity={0.9} />
      ))}
      <Bacak bx={-60} k={0} />
      <Bacak bx={92} k={Math.PI} />
      <path d="M 68 -208 C 94 -244 110 -282 120 -304 L 164 -292 C 152 -252 132 -200 110 -168 Z" fill="#8b5839" />
      <path d="M 96 -200 C 112 -230 124 -260 132 -280" stroke="#c49a74" strokeWidth={10} fill="none" opacity={0.7} />
      <g transform={`rotate(${yuru ? Math.sin(f) * 2 : Math.sin(t * 1.5) * 2} 140 -300)`}>
        <path d="M 138 -336 C 128 -380 140 -420 124 -462 M 134 -384 L 108 -404 M 132 -420 L 150 -446 M 128 -446 L 112 -470" stroke="#9b7650" strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M 160 -338 C 168 -384 188 -410 182 -452 M 171 -390 L 197 -400 M 181 -424 L 202 -440 M 184 -446 L 170 -470" stroke="#9b7650" strokeWidth={8} strokeLinecap="round" fill="none" />
        <ellipse cx={122} cy={-332} rx={20} ry={8} fill="#8a5739" transform="rotate(-30 122 -332)" />
        <ellipse cx={122} cy={-332} rx={12} ry={4} fill="#d8a98a" transform="rotate(-30 122 -332)" />
        <ellipse cx={150} cy={-312} rx={40} ry={30} fill="#8f5c3c" transform="rotate(15 150 -312)" />
        <ellipse cx={183} cy={-297} rx={22} ry={17} fill="#a77a56" />
        <circle cx={199} cy={-299} r={8} fill="#2a1e1a" />
        <circle cx={150} cy={-320} r={6.5} fill="#1e1612" />
        <circle cx={152} cy={-322} r={2} fill="#fff" />
        <path d="M 176 -284 Q 186 -280 194 -286" stroke="#5c3a26" strokeWidth={2} fill="none" />
      </g>
      {/* koşum ve çanlar */}
      <path d="M 98 -258 C 112 -238 134 -230 152 -240" stroke="#d22f2a" strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M 70 -216 C 86 -182 92 -152 82 -126" stroke="#d22f2a" strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M 8 -232 L 0 -124" stroke="#d22f2a" strokeWidth={12} strokeLinecap="round" />
      <path d="M 8 -232 C 40 -236 70 -228 98 -254" stroke="#d22f2a" strokeWidth={10} fill="none" strokeLinecap="round" />
      <rect x={-2} y={-186} width={14} height={14} fill="none" stroke="#e2b23d" strokeWidth={3} />
      {[[108, -230], [128, -224]].map(([a, b], i) => (
        <g key={i} transform={`rotate(${Math.sin(t * 6 + i) * 8} ${a} ${b - 10})`}>
          <circle cx={a} cy={b} r={10} fill="#e2b23d" stroke="#a87d1e" strokeWidth={2} />
          <path d={`M ${a - 6} ${b + 3} L ${a + 6} ${b + 3}`} stroke="#7a5a14" strokeWidth={2} />
          <circle cx={a - 3} cy={b - 4} r={2.5} fill="#fff3c4" />
        </g>
      ))}
    </g>
  );
};

/** Hans Christian Andersen: kıvırcık kahverengi saç, uzun burun, kahverengi ceket, beyaz yaka ve siyah fular; tüy kalemle yazar. */
export const Andersen: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => {
  const kalem = Math.sin(t * 9) * 4;
  const acik = kirpma(t, 1.9);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -120 0 C -110 -120 -76 -172 0 -178 C 76 -172 110 -120 120 0 Z" fill="#5b3f2c" />
      <path d="M 40 -170 C 80 -150 104 -100 120 0 L 80 0 C 70 -80 60 -130 40 -170 Z" fill="#4a3222" opacity={0.6} />
      <path d="M -26 -174 L 0 -126 L 26 -174 Z" fill="#f5efe2" />
      <path d="M -14 -160 L 0 -150 L 14 -160 L 14 -146 L 0 -150 L -14 -146 Z" fill="#2a2220" />
      <rect x={-13} y={-198} width={26} height={30} fill="#e9bf9d" />
      <ellipse cx={-4} cy={-244} rx={42} ry={52} fill="#efc9a8" />
      <path d="M -16 -258 C -36 -236 -42 -222 -26 -214 Q -18 -212 -12 -218" fill="#e6b593" stroke="#cf9a78" strokeWidth={1.5} />
      <Goz x={-24} y={-262} r={5.5} iris="#6b5a44" acik={Math.min(acik, 0.4)} kas="#4a3222" />
      <Goz x={10} y={-262} r={5.5} iris="#6b5a44" acik={Math.min(acik, 0.4)} kas="#4a3222" />
      <path d="M -34 -276 Q -24 -282 -14 -276 M 2 -276 Q 12 -282 22 -276" stroke="#5a3d26" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M -22 -205 Q -12 -200 -2 -205" stroke="#b5655e" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {[[-40, -282], [-24, -298], [-4, -302], [16, -296], [32, -282], [-46, -262], [38, -262], [-46, -240], [40, -240]].map(([a, b], i) => (
        <circle key={i} cx={a} cy={b} r={17} fill={i % 2 ? '#6b4a2e' : '#5e3f26'} />
      ))}
      <ellipse cx={38} cy={-238} rx={7} ry={11} fill="#e9bf9d" />
      {/* kâğıt + kol + tüy kalem */}
      <path d="M -150 -6 L 30 -6 L 50 18 L -130 18 Z" fill="#f4ead3" stroke="#d9c9a6" strokeWidth={1.5} />
      {[-130, -110, -90, -70, -50].map((k, i) => (
        <line key={k} x1={k + i} y1={2} x2={k + 70} y2={2} stroke="#8a7a62" strokeWidth={1.5} opacity={0.6} transform={`translate(${i * 8} ${i * 3 - 6})`} />
      ))}
      <path d="M 70 -130 C 50 -80 0 -30 -50 -14" stroke="#5b3f2c" strokeWidth={30} strokeLinecap="round" fill="none" />
      <g transform={`translate(-54 -12) rotate(${kalem})`}>
        <path d="M 0 0 C -18 -50 -30 -84 -58 -118 C -36 -80 -16 -42 4 -4 Z" fill="#f7f3ea" stroke="#cfc6b3" strokeWidth={1.5} />
        <path d="M 0 0 L -50 -108" stroke="#cfc6b3" strokeWidth={1.2} />
      </g>
      <circle cx={-52} cy={-12} r={13} fill="#efc9a8" />
    </g>
  );
};
