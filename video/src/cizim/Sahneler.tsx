import React from 'react';
import {Andersen, ElAynasi, Gerda, Gul, Kay, Kralice, RenGeyigi, Trol} from './Karakterler';

// Kodla çizilmiş sahneler (1920x1080). Sıcak, aydınlık masal kitabı paleti: bal, kehribar, krem, sıcak kırmızı.
// Kural: mor-mavi gradyan yok, uçuşan parçacık yok. Buz/kar beyaz-krem ve çok açık su yeşili düz renklerle.
// t: bölümün başından saniye, olay: anlatımdan çözülmüş olay zamanları (kirilma, parca, buz, sayfa).

export type SahneProps = {t: number; olay: Record<string, number>};
const kis = (x: number) => Math.min(1, Math.max(0, x));
const yumusak = (x: number) => {
  const u = kis(x);
  return u * u * (3 - 2 * u);
};

const Cam: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-8} y={-30} width={16} height={34} fill="#5a3a24" />
    {[[0, 150, 70], [-30, 110, 92], [-62, 74, 112], [-96, 40, 132]].map(([dy, w, h], i) => (
      <g key={i}>
        <path d={`M 0 ${-dy - h - 80} L ${w / 2 + 24} ${-dy - 34} L ${-w / 2 - 24} ${-dy - 34} Z`} fill={i % 2 ? '#2f4b3b' : '#35543f'} />
        <path d={`M 0 ${-dy - h - 80} L ${w / 2 + 24} ${-dy - 34} L ${w / 4} ${-dy - 40} Z`} fill="#243b2e" opacity={0.6} />
        <path d={`M 0 ${-dy - h - 78} L ${w / 2 + 10} ${-dy - 48} Q ${w / 4} ${-dy - 58} 0 ${-dy - 50} Q ${-w / 4} ${-dy - 58} ${-w / 2 - 10} ${-dy - 48} Z`} fill="#fbf7ef" opacity={0.92} />
      </g>
    ))}
  </g>
);

const GokYuzu: React.FC<{id: string; renkler: string[]; ufuk: number}> = ({id, renkler, ufuk}) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2={ufuk} gradientUnits="userSpaceOnUse">
        {renkler.map((r, i) => (
          <stop key={i} offset={i / (renkler.length - 1)} stopColor={r} />
        ))}
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill={`url(#${id})`} />
  </>
);

const Isilti: React.FC<{id: string; x: number; y: number; r: number; renk: string; guc?: number}> = ({id, x, y, r, renk, guc = 1}) => (
  <>
    <defs>
      <radialGradient id={id} cx={x} cy={y} r={r} gradientUnits="userSpaceOnUse">
        <stop offset={0} stopColor={renk} stopOpacity={0.95 * guc} />
        <stop offset={0.35} stopColor={renk} stopOpacity={0.45 * guc} />
        <stop offset={1} stopColor={renk} stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={1920} height={1080} fill={`url(#${id})`} />
  </>
);

/* ---------------- 1: Buz sarayı, gün doğumu ---------------- */
const KULELER: [number, number, number][] = [
  [960, 70, 330], [872, 54, 232], [1050, 56, 252], [800, 44, 170], [1122, 48, 182], [742, 38, 118], [1186, 40, 128],
];
const Saray: React.FC<{pencere?: boolean}> = ({pencere = true}) => (
  <g>
    <path d="M 712 640 L 712 572 L 1214 572 L 1214 640 Z" fill="#f3f9f8" />
    <path d="M 712 572 L 1214 572 L 1214 588 L 712 588 Z" fill="#dcecec" />
    {KULELER.map(([x, w, h], i) => (
      <g key={i}>
        <rect x={x - w / 2} y={640 - h} width={w} height={h} fill="#f6fbfa" />
        <rect x={x} y={640 - h} width={w / 2} height={h} fill="#b9dade" />
        <rect x={x - w / 2} y={640 - h} width={w} height={h} fill="none" stroke="#8fbcc4" strokeWidth={2} />
        <path d={`M ${x - w / 2 - 4} ${640 - h} L ${x} ${640 - h - w * 1.5} L ${x + w / 2 + 4} ${640 - h} Z`} fill="#eef7f7" />
        <path d={`M ${x} ${640 - h - w * 1.5} L ${x + w / 2 + 4} ${640 - h} L ${x} ${640 - h} Z`} fill="#a9d2d8" />
        {pencere
          ? [0.3, 0.55].map((k) => (
              <path key={k} d={`M ${x - 7} ${640 - h * (1 - k) + 14} L ${x - 7} ${640 - h * (1 - k)} Q ${x} ${640 - h * (1 - k) - 10} ${x + 7} ${640 - h * (1 - k)} L ${x + 7} ${640 - h * (1 - k) + 14} Z`} fill="#ffd27a" />
            ))
          : null}
      </g>
    ))}
    <path d="M 930 640 L 930 600 Q 960 572 990 600 L 990 640 Z" fill="#ffcf72" />
  </g>
);

export const SahneSaray: React.FC<SahneProps> = ({t}) => {
  const isilti = ((t * 0.22) % 1.4) - 0.2;
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <GokYuzu id="g1" renkler={['#e8884c', '#f1a764', '#f7c88a', '#fbe0b2']} ufuk={640} />
      <Isilti id="i1" x={1190} y={560} r={620} renk="#fff1c8" guc={0.9 + 0.1 * Math.sin(t * 1.3)} />
      <path d="M 0 560 L 160 470 L 300 530 L 460 440 L 640 540 L 820 500 L 980 560 L 1300 480 L 1500 540 L 1700 460 L 1920 520 L 1920 640 L 0 640 Z" fill="#d6a283" />
      <path d="M 160 470 L 200 492 L 175 500 Z M 460 440 L 510 468 L 470 474 Z M 1300 480 L 1340 500 L 1310 505 Z M 1700 460 L 1745 484 L 1712 490 Z" fill="#fbf1e4" />
      <path d="M 0 600 C 300 570 600 610 900 596 C 1200 584 1500 612 1920 590 L 1920 640 L 0 640 Z" fill="#e7c3a0" />
      <circle cx={1190} cy={560} r={58} fill="#fff8e6" />
      <Saray />
      <defs>
        <clipPath id="sarayKirp">
          <rect x={712} y={300} width={502} height={340} />
        </clipPath>
        <linearGradient id="seritg" x1="0" x2="1">
          <stop offset={0} stopColor="#fff" stopOpacity={0} />
          <stop offset={0.5} stopColor="#fff" stopOpacity={0.75} />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g clipPath="url(#sarayKirp)">
        <rect x={700 + isilti * 600} y={250} width={110} height={420} fill="url(#seritg)" transform="skewX(-18)" opacity={0.7} />
      </g>
      {/* donmuş göl + yansıma */}
      <rect x={0} y={640} width={1920} height={150} fill="#dcd6cb" />
      <g opacity={0.28} transform="translate(0 1280) scale(1 -1)">
        <Saray pencere={false} />
      </g>
      <rect x={0} y={640} width={1920} height={150} fill="#f6e7cf" opacity={0.35} />
      <path d="M 1130 650 L 1250 650 L 1300 790 L 1080 790 Z" fill="#fff2cf" opacity={0.7} />
      {[668, 700, 738].map((k, i) => (
        <path key={k} d={`M ${1100 - i * 20} ${k} Q 1190 ${k - 4} ${1280 + i * 20} ${k}`} stroke="#fffaf0" strokeWidth={3} fill="none" opacity={0.8} />
      ))}
      <path d="M 300 700 L 420 690 L 520 712 M 1500 720 L 1620 706 L 1700 722" stroke="#d7ddd8" strokeWidth={2} fill="none" />
      {/* ön kar */}
      <path d="M 0 760 C 300 730 600 790 960 772 C 1300 752 1600 790 1920 760 L 1920 1080 L 0 1080 Z" fill="#fbf6ee" />
      <path d="M 0 860 C 260 830 520 880 760 870 C 600 900 300 900 0 920 Z M 1920 880 C 1660 850 1400 900 1180 890 C 1360 930 1660 930 1920 950 Z" fill="#e3cdb2" />
      <path d="M 640 1080 C 760 980 900 860 990 790 L 1010 790 C 960 860 880 980 820 1080 Z" fill="#fff3dc" opacity={0.6} />
      {Array.from({length: 9}, (_, i) => i).map((i) => {
        const u = i / 8;
        const cx = 760 + (995 - 760) * u + (i % 2 ? 14 : -14) * (1 - u);
        const cy = 1050 - (1050 - 800) * u;
        return <ellipse key={i} cx={cx} cy={cy} rx={11 * (1 - u * 0.7)} ry={6 * (1 - u * 0.7)} fill="#dccdb8" />;
      })}
      <Cam x={170} y={900} s={1.5} />
      <Cam x={330} y={860} s={1.1} />
      <Cam x={70} y={1010} s={1.9} />
      <Cam x={1730} y={880} s={1.4} />
      <Cam x={1860} y={980} s={1.8} />
      <Cam x={1580} y={840} s={0.9} />
    </svg>
  );
};

/* ---------------- 2: Kopenhag, Andersen pencerede ---------------- */
const EVLER: [number, number, string][] = [
  [0, 150, '#d8573b'], [150, 140, '#e9b44c'], [290, 160, '#3f7a74'], [450, 135, '#e98c3c'], [585, 150, '#efe0bf'], [735, 140, '#7d9b5c'], [875, 160, '#c9463a'], [1035, 150, '#e6a63f'],
];
export const SahneKopenhag: React.FC<SahneProps> = ({t}) => {
  const mum = 1 + Math.sin(t * 17) * 0.06 + Math.sin(t * 7.3) * 0.05;
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <GokYuzu id="g2" renkler={['#ee9f68', '#f5c08a', '#f9dcae', '#fbe8c6']} ufuk={640} />
      <Isilti id="i2" x={300} y={560} r={700} renk="#ffe0a8" guc={0.7} />
      {EVLER.map(([x, w, r], i) => {
        const h = 330 + ((i * 53) % 110);
        const ust = 690 - h;
        return (
          <g key={i}>
            <rect x={x} y={ust} width={w} height={h} fill={r} />
            <rect x={x + w - 18} y={ust} width={18} height={h} fill="#000" opacity={0.12} />
            <path d={`M ${x - 4} ${ust} L ${x + w / 2} ${ust - 70} L ${x + w + 4} ${ust} Z`} fill="#7a3a2a" />
            <path d={`M ${x - 4} ${ust} L ${x + w / 2} ${ust - 70} L ${x + w / 2} ${ust - 56} L ${x + 6} ${ust - 4} Z`} fill="#fbf6ee" />
            <path d={`M ${x + w / 2} ${ust - 70} L ${x + w + 4} ${ust} L ${x + w - 6} ${ust - 4} L ${x + w / 2} ${ust - 56} Z`} fill="#efe5d6" />
            {[0, 1, 2].map((sat) =>
              [0, 1, 2].map((sut) => {
                const acik = (i + sat * 2 + sut) % 3 !== 0;
                return <rect key={`${sat}${sut}`} x={x + 18 + sut * ((w - 36) / 3)} y={ust + 40 + sat * 85} width={(w - 36) / 3 - 14} height={46} rx={3} fill={acik ? '#ffd98a' : '#5a4a40'} stroke="#fbf3e2" strokeWidth={4} />;
              }),
            )}
            <rect x={x + w / 2 - 16} y={640} width={32} height={50} fill="#4a3426" />
          </g>
        );
      })}
      <rect x={0} y={690} width={1200} height={14} fill="#fbf6ee" />
      <rect x={0} y={704} width={1200} height={200} fill="#7f9a90" />
      {EVLER.map(([x, w, r], i) => (
        <rect key={i} x={x + 10} y={712} width={w - 20} height={120} fill={r} opacity={0.35} />
      ))}
      {[730, 760, 795, 830].map((k, i) => (
        <path key={k} d={`M ${40 + i * 30} ${k} Q 300 ${k - 6} 560 ${k} T 1100 ${k}`} stroke="#fbe6bf" strokeWidth={3} fill="none" opacity={0.55} />
      ))}
      {/* tekne */}
      <g transform={`translate(520 ${770 + Math.sin(t * 1.6) * 3})`}>
        <path d="M -150 0 L 150 0 L 120 40 L -120 40 Z" fill="#4a3426" />
        <rect x={-150} y={-6} width={300} height={8} fill="#c9a26a" />
        <line x1={0} y1={0} x2={0} y2={-330} stroke="#3e2b1f" strokeWidth={6} />
        <line x1={0} y1={-330} x2={-140} y2={-4} stroke="#3e2b1f" strokeWidth={1.5} />
        <line x1={0} y1={-330} x2={140} y2={-4} stroke="#3e2b1f" strokeWidth={1.5} />
        <line x1={-60} y1={-250} x2={60} y2={-250} stroke="#3e2b1f" strokeWidth={4} />
      </g>
      <path d="M 0 900 L 1200 900 L 1200 1080 L 0 1080 Z" fill="#f7efe2" />
      <path d="M 0 900 L 1200 900 L 1200 920 L 0 920 Z" fill="#8a6a50" />
      {/* yakın bina: tuğla duvar ve pencere */}
      <rect x={1150} y={0} width={770} height={1080} fill="#97503a" />
      {Array.from({length: 27}, (_, r) =>
        Array.from({length: 9}, (_, c) => (
          <rect key={`${r}-${c}`} x={1150 + c * 90 + (r % 2) * 45 - 45} y={r * 40} width={84} height={34} fill={(r * 7 + c * 3) % 5 === 0 ? '#a65a42' : '#8c4a35'} />
        )),
      )}
      <rect x={1240} y={150} width={600} height={700} fill="#6b4630" />
      <rect x={1270} y={180} width={540} height={640} fill="#e8b46a" />
      <Isilti id="i2b" x={1700} y={600} r={520} renk="#fff0c4" guc={0.85 * mum} />
      <rect x={1270} y={180} width={540} height={120} fill="#c98f4a" opacity={0.5} />
      <path d="M 1290 300 L 1290 820 M 1790 300 L 1790 820" stroke="#a66f3a" strokeWidth={10} opacity={0.5} />
      <Andersen x={1500} y={690} s={1.15} t={t} />
      <rect x={1220} y={690} width={640} height={36} fill="#7a5236" />
      <path d="M 1220 690 Q 1540 672 1860 690 L 1860 700 L 1220 700 Z" fill="#fbf6ee" />
      {/* mum */}
      <g transform="translate(1745 690)">
        <ellipse cx={0} cy={-4} rx={34} ry={8} fill="#c9963e" />
        <rect x={-13} y={-90} width={26} height={86} fill="#f5ecd6" />
        <rect x={4} y={-90} width={9} height={86} fill="#dcd0b4" />
        <g transform={`translate(0 -94) scale(${mum} ${mum})`}>
          <path d="M 0 -42 C 10 -24 12 -8 0 0 C -12 -8 -10 -24 0 -42 Z" fill="#ffcf5a" />
          <path d="M 0 -26 C 5 -16 5 -6 0 -2 C -5 -6 -5 -16 0 -26 Z" fill="#fff5d0" />
        </g>
      </g>
      <rect x={1240} y={150} width={600} height={30} fill="#5a3a26" />
      <path d="M 1230 150 Q 1540 130 1850 150 L 1850 160 L 1230 160 Z" fill="#fbf6ee" />
    </svg>
  );
};

/* ---------------- 3: Trolün atölyesi ---------------- */
const Disli: React.FC<{x: number; y: number; r: number; d: number}> = ({x, y, r, d}) => (
  <g transform={`translate(${x} ${y}) rotate(${d})`}>
    {Array.from({length: 10}, (_, i) => (
      <rect key={i} x={-r * 0.16} y={-r * 1.18} width={r * 0.32} height={r * 0.4} fill="#b0894a" transform={`rotate(${i * 36})`} />
    ))}
    <circle r={r} fill="#b0894a" />
    <circle r={r * 0.4} fill="#7a5a30" />
  </g>
);
export const SahneAtolye: React.FC<SahneProps> = ({t}) => {
  const lamba = Math.sin(t * 1.4) * 2.5;
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <rect width={1920} height={1080} fill="#8a5530" />
      <Isilti id="i3" x={1150} y={220} r={1100} renk="#f6c983" guc={1} />
      {/* raflar */}
      {[300, 500].map((y) => (
        <g key={y}>
          <rect x={80} y={y} width={640} height={18} fill="#5e3a20" />
          <rect x={1380} y={y} width={480} height={18} fill="#5e3a20" />
        </g>
      ))}
      {[[120, 300, '#d9a35a'], [200, 300, '#8aa06a'], [270, 300, '#c4683f'], [420, 300, '#e3c27a'], [560, 300, '#7f9a8a'], [1420, 300, '#c4683f'], [1520, 300, '#d9a35a'], [1700, 300, '#8aa06a'], [160, 500, '#e3c27a'], [330, 500, '#c4683f'], [1450, 500, '#7f9a8a'], [1780, 500, '#d9a35a']].map(([x, y, r], i) => (
        <g key={i}>
          <rect x={Number(x)} y={Number(y) - 70 - (i % 3) * 14} width={46} height={70 + (i % 3) * 14} rx={8} fill={String(r)} />
          <rect x={Number(x) - 3} y={Number(y) - 80 - (i % 3) * 14} width={52} height={12} rx={3} fill="#6e4a2a" />
          <rect x={Number(x) + 8} y={Number(y) - 56 - (i % 3) * 14} width={10} height={40} fill="#fff" opacity={0.25} />
        </g>
      ))}
      <Disli x={650} y={262} r={30} d={t * 20} />
      <Disli x={480} y={470} r={24} d={-t * 25} />
      <Disli x={1620} y={470} r={26} d={t * 18} />
      {/* saat */}
      <g transform="translate(1650 190)">
        <circle r={56} fill="#7a4a2a" />
        <circle r={46} fill="#f3e6c8" />
        <line x1={0} y1={0} x2={0} y2={-34} stroke="#3a2a1a" strokeWidth={4} transform={`rotate(${t * 6})`} />
        <line x1={0} y1={0} x2={22} y2={0} stroke="#3a2a1a" strokeWidth={5} />
      </g>
      {/* lamba */}
      <g transform={`rotate(${lamba} 1150 0)`}>
        <line x1={1150} y1={0} x2={1150} y2={100} stroke="#3a2a1a" strokeWidth={4} />
        <path d="M 1100 160 L 1200 160 L 1175 100 L 1125 100 Z" fill="#3f5a4a" />
        <path d="M 1100 160 L 1200 160 L 1196 150 L 1104 150 Z" fill="#c8963e" />
        <ellipse cx={1150} cy={166} rx={22} ry={12} fill="#fff3c8" />
      </g>
      {/* tezgâh */}
      <rect x={0} y={780} width={1920} height={300} fill="#6e4426" />
      <rect x={0} y={770} width={1920} height={22} fill="#94623a" />
      {[840, 900, 960, 1020].map((k) => (
        <path key={k} d={`M 0 ${k} Q 480 ${k - 10} 960 ${k} T 1920 ${k}`} stroke="#5e3a20" strokeWidth={2} fill="none" opacity={0.6} />
      ))}
      {/* tezgâhtaki taze çiçekler (aynada gri görünür) */}
      <g transform="translate(470 780)">
        <path d="M -36 0 L 36 0 L 28 -90 Q 0 -100 -28 -90 Z" fill="#4f88a0" />
        <path d="M -24 -96 L 24 -96 L 20 -110 L -20 -110 Z" fill="#3f7088" />
        <path d="M -6 -108 C -20 -160 -40 -180 -46 -200 M 0 -108 C 0 -170 6 -200 4 -230 M 6 -108 C 20 -150 40 -170 50 -196" stroke="#4c7a3c" strokeWidth={4} fill="none" />
        <Gul x={-46} y={-180} s={1.1} d={-15} />
        <Gul x={4} y={-212} s={1.2} />
        <Gul x={50} y={-176} s={1.1} d={15} />
      </g>
      <g transform="translate(760 786)">
        <rect x={-60} y={-20} width={120} height={20} rx={4} fill="#9a9a9a" />
        <rect x={-6} y={-80} width={12} height={62} fill="#7a5a3a" />
      </g>
      <Trol x={1130} y={1000} s={1.75} t={t} />
    </svg>
  );
};

/* ---------------- 4: Ayna kırılıyor (çatlak, parçalar dağılmaz) ---------------- */
const CATLAKLAR = [
  'M 0 0 L 18 -40 L 12 -70 L 30 -120',
  'M 0 0 L 40 -12 L 70 -40 L 96 -48',
  'M 0 0 L 46 30 L 60 70 L 92 96',
  'M 0 0 L 10 50 L -6 96 L 4 150',
  'M 0 0 L -36 34 L -62 50 L -92 88',
  'M 0 0 L -44 -6 L -70 -30 L -100 -36',
  'M 0 0 L -20 -44 L -40 -70 L -46 -118',
  'M 18 -40 L 44 -60 M 46 30 L 76 30 M -36 34 L -40 70 M -44 -6 L -60 18 M 10 50 L 34 64',
];
export const SahneAyna: React.FC<SahneProps> = ({t, olay}) => {
  const k = yumusak((t - (olay.kirilma ?? 1e9)) / 0.45);
  const flas = Math.max(0, 1 - Math.abs(t - (olay.kirilma ?? -9)) / 0.25);
  const bob = Math.sin(t * 1.6) * 8;
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <GokYuzu id="g4" renkler={['#dd7a48', '#ea9b64', '#f3bf88', '#f9d9ac']} ufuk={760} />
      <Isilti id="i4" x={1150} y={470} r={650} renk="#fff0c8" guc={0.8} />
      {[[200, 640, 220, 60], [600, 700, 260, 70], [1500, 660, 300, 70], [1800, 720, 240, 60], [980, 760, 360, 80]].map(([x, y, rx, ry], i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#fff1db" opacity={0.75} />
      ))}
      {/* çatılar */}
      {[[-40, 840, 380, '#8a4a36'], [300, 880, 340, '#6d4a3a'], [600, 850, 400, '#9a5a3c'], [960, 900, 360, '#7a4a34'], [1280, 860, 380, '#8a4a36'], [1620, 890, 360, '#6d4a3a']].map(([x, y, w, r], i) => (
        <g key={i}>
          <rect x={Number(x)} y={Number(y)} width={Number(w)} height={300} fill={String(r)} />
          <path d={`M ${Number(x) - 20} ${Number(y)} L ${Number(x) + Number(w) / 2} ${Number(y) - 120} L ${Number(x) + Number(w) + 20} ${Number(y)} Z`} fill="#5a3426" />
          <path d={`M ${Number(x) - 20} ${Number(y)} L ${Number(x) + Number(w) / 2} ${Number(y) - 120} L ${Number(x) + Number(w) + 20} ${Number(y)} L ${Number(x) + Number(w)} ${Number(y) - 12} L ${Number(x) + Number(w) / 2} ${Number(y) - 100} L ${Number(x)} ${Number(y) - 12} Z`} fill="#fbf6ee" />
          <rect x={Number(x) + Number(w) * 0.7} y={Number(y) - 150} width={34} height={90} fill="#6a3a2a" />
          <rect x={Number(x) + Number(w) * 0.7 - 4} y={Number(y) - 158} width={42} height={12} fill="#fbf6ee" />
          <rect x={Number(x) + 60} y={Number(y) + 50} width={50} height={60} fill="#ffd98a" />
          <rect x={Number(x) + Number(w) - 120} y={Number(y) + 50} width={50} height={60} fill="#ffd98a" />
        </g>
      ))}
      {/* ayna */}
      <g transform={`translate(1150 ${880 + bob}) rotate(-6) scale(2.55)`}>
        <ElAynasi id="buyuk" icerik={<rect x={-60} y={-230} width={120} height={160} fill="#f6d9ad" />} />
        <g clipPath="url(#cam-buyuk)">
        <g transform="translate(6 -158)" opacity={k > 0 ? 1 : 0}>
          {CATLAKLAR.map((d, i) => (
            <g key={i}>
              <path d={d} stroke="#7d8a92" strokeWidth={2.4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} strokeLinejoin="round" />
              <path d={d} stroke="#ffffff" strokeWidth={1.2} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} strokeLinejoin="round" />
            </g>
          ))}
        </g>
        </g>
      </g>
      <Isilti id="i4f" x={1165} y={480 + bob} r={420} renk="#ffffff" guc={flas} />
    </svg>
  );
};

/* ---------------- 5: Çatı bahçesi, Gerda ve Kay ---------------- */
export const SahneBahce: React.FC<SahneProps> = ({t, olay}) => {
  const p = olay.parca ?? 1e9;
  const u = kis((t - p - 0.3) / 0.9);
  const parca = u > 0 && u < 1;
  const px = 1820 + (1219 - 1820) * u;
  const py = 120 + (385 - 120) * u - Math.sin(u * Math.PI) * 120;
  const goz = yumusak((t - p - 1.25) / 0.45);
  const buz = yumusak((t - (olay.buz ?? 1e9) + 0.1) / 0.9);
  const kutu = (x: number, y: number, w: number, adet: number, s = 1) => (
    <g>
      {Array.from({length: adet}, (_, i) => (
        <Gul key={i} x={x + 30 + (i * (w - 60)) / Math.max(1, adet - 1)} y={y + 4 + (i % 2) * 10} s={s * (1 + (i % 3) * 0.12)} d={Math.sin(t * 1.2 + i) * 4 + ((i % 3) - 1) * 10} />
      ))}
      <rect x={x} y={y} width={w} height={80 * s} fill="#8a5a36" />
      <rect x={x} y={y} width={w} height={10} fill="#fbf6ee" />
      <path d={`M ${x} ${y + 40 * s} L ${x + w} ${y + 40 * s}`} stroke="#6e4426" strokeWidth={3} />
    </g>
  );
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <GokYuzu id="g5" renkler={['#e8935a', '#f2b77e', '#f7d4a4']} ufuk={700} />
      <Isilti id="i5" x={1500} y={600} r={700} renk="#fff0c8" guc={0.7} />
      {[[560, 560, 200], [760, 600, 180], [940, 540, 220], [1160, 590, 190], [1350, 550, 230], [1580, 600, 200], [1780, 560, 220]].map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={300} fill={i % 2 ? '#b8735a' : '#c98a66'} />
          <path d={`M ${x - 10} ${y} L ${x + w / 2} ${y - 80} L ${x + w + 10} ${y} Z`} fill="#fbf6ee" />
          <rect x={x + w * 0.6} y={y - 110} width={26} height={60} fill="#8a4a36" />
          <rect x={x + 30} y={y + 50} width={36} height={44} fill="#ffd98a" />
          <rect x={x + w - 70} y={y + 50} width={36} height={44} fill={i % 3 ? '#ffd98a' : '#6a4a3a'} />
        </g>
      ))}
      {/* sol bina ve parlayan pencere */}
      <rect x={0} y={0} width={560} height={860} fill="#d6ad80" />
      <rect x={500} y={0} width={60} height={860} fill="#b88a5e" />
      <rect x={90} y={130} width={380} height={520} fill="#7a4a2e" />
      <rect x={110} y={150} width={340} height={480} fill="#ffd889" />
      <Isilti id="i5b" x={280} y={400} r={420} renk="#fff3cc" guc={0.9} />
      <path d="M 280 150 L 280 630 M 110 390 L 450 390" stroke="#7a4a2e" strokeWidth={12} />
      <path d="M 110 150 Q 150 330 128 630 L 110 630 Z M 450 150 Q 410 330 432 630 L 450 630 Z" fill="#c8463a" />
      <rect x={70} y={640} width={420} height={22} fill="#fbf6ee" />
      {/* zemin */}
      <path d="M 0 820 C 400 800 1000 830 1920 810 L 1920 1080 L 0 1080 Z" fill="#fbf5ec" />
      <path d="M 0 900 C 500 880 1200 920 1920 890 L 1920 920 C 1200 950 500 920 0 940 Z" fill="#efe3d2" />
      {kutu(560, 760, 380, 6)}
      {kutu(1420, 770, 420, 6)}
      <Gerda x={720} y={1010} s={1.22} t={t} gul />
      <Kay x={1240} y={1010} s={1.22} t={t} goz={goz} buz={buz} />
      {kutu(-20, 980, 420, 6, 1.3)}
      {kutu(1540, 990, 420, 6, 1.3)}
      {parca ? (
        <g transform={`translate(${px} ${py}) rotate(${u * 300})`}>
          <path d="M 0 -9 L 5 0 L 0 9 L -5 0 Z" fill="#ffffff" stroke="#bfe3ea" strokeWidth={1.5} />
          <circle r={14} fill="#ffffff" opacity={0.35} />
        </g>
      ) : null}
    </svg>
  );
};

/* ---------------- 6: Kuzeye yolculuk, Gerda ve ren geyiği ---------------- */
export const SahneYolculuk: React.FC<SahneProps> = ({t}) => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%">
    <GokYuzu id="g6" renkler={['#e58a48', '#f0ab62', '#f7cc8a', '#fce3b4']} ufuk={580} />
    <Isilti id="i6" x={1250} y={545} r={800} renk="#fff4cf" guc={0.95} />
    <path d="M 0 520 C 300 480 600 530 900 506 C 1200 486 1500 520 1920 500 L 1920 590 L 0 590 Z" fill="#e3b88f" />
    <path d="M 0 560 C 400 540 800 575 1200 556 C 1500 545 1700 565 1920 555 L 1920 600 L 0 600 Z" fill="#eccdab" />
    <circle cx={1250} cy={548} r={56} fill="#fff8e4" />
    <rect x={0} y={580} width={1920} height={500} fill="#fbf3e6" />
    <path d="M 0 700 C 400 680 900 720 1920 690 L 1920 720 C 900 750 400 710 0 730 Z M 0 860 C 500 840 1100 880 1920 850 L 1920 880 C 1100 910 500 870 0 890 Z" fill="#e6d0b3" />
    <path d="M 1236 585 L 1264 585 L 1020 1080 L 860 1080 Z" fill="#ffe9b8" opacity={0.65} />
    <path d="M 1240 586 L 900 1080 M 1260 586 L 1000 1080" stroke="#e5d2b5" strokeWidth={5} fill="none" />
    <ellipse cx={610} cy={1016} rx={240} ry={20} fill="#d9c7ad" opacity={0.6} />
    <ellipse cx={1010} cy={1016} rx={300} ry={22} fill="#d9c7ad" opacity={0.6} />
    <RenGeyigi x={1190} y={1005} s={1.25} t={t} yuru sola />
    <Gerda x={790} y={1012} s={1.15} t={t} yuru />
  </svg>
);

/* ---------------- 8: Karlar Kraliçesi'nin buz salonu ---------------- */
const Sutun: React.FC<{x: number; w: number}> = ({x, w}) => (
  <g>
    <rect x={x - w / 2} y={60} width={w} height={830} fill="#f3f9f9" />
    <rect x={x} y={60} width={w / 2} height={830} fill="#d6eaec" />
    <rect x={x + w / 4} y={60} width={w / 4} height={830} fill="#c2dde1" />
    <path d={`M ${x - w / 2 + 12} 80 L ${x - w / 2 + 12} 880`} stroke="#ffffff" strokeWidth={6} opacity={0.8} />
    <rect x={x - w / 2 - 14} y={860} width={w + 28} height={40} fill="#e7f2f2" />
    <rect x={x - w / 2 - 14} y={60} width={w + 28} height={36} fill="#e7f2f2" />
  </g>
);
export const SahneSalon: React.FC<SahneProps> = ({t}) => {
  const isik = 0.32 + 0.06 * Math.sin(t * 0.9);
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <GokYuzu id="g8" renkler={['#c4925f', '#d4aa7c', '#e2c39a']} ufuk={880} />
      {[420, 1500].map((x) => (
        <g key={x}>
          <path d={`M ${x - 120} 760 L ${x - 120} 260 Q ${x} 110 ${x + 120} 260 L ${x + 120} 760 Z`} fill="#fbe5ad" />
          <path d={`M ${x - 120} 760 L ${x - 120} 260 Q ${x} 110 ${x + 120} 260 L ${x + 120} 760 Z`} fill="none" stroke="#e4cfa4" strokeWidth={14} />
          <path d={`M ${x} 160 L ${x} 760 M ${x - 120} 460 L ${x + 120} 460`} stroke="#e4cfa4" strokeWidth={8} />
          <path d={`M ${x - 120} 760 L ${x + 120} 760 L ${x + 420} 1080 L ${x - 60} 1080 Z`} fill="#fff4d4" opacity={isik} />
        </g>
      ))}
      <Isilti id="i8" x={960} y={420} r={760} renk="#fff3d2" guc={0.75} />
      <Sutun x={170} w={130} />
      <Sutun x={700} w={110} />
      <Sutun x={1220} w={110} />
      <Sutun x={1760} w={130} />
      <rect x={0} y={40} width={1920} height={30} fill="#eaf4f4" />
      {Array.from({length: 40}, (_, i) => (
        <path key={i} d={`M ${i * 48 + 4} 68 L ${i * 48 + 24} ${110 + (i * 37) % 50} L ${i * 48 + 44} 68 Z`} fill="#f4fafa" stroke="#cfe5e8" strokeWidth={1.5} />
      ))}
      <rect x={0} y={890} width={1920} height={190} fill="#d8c8ae" />
      <path d="M 0 890 L 1920 890" stroke="#f8f4ea" strokeWidth={6} />
      {[930, 980, 1040].map((k) => (
        <path key={k} d={`M 0 ${k} L 1920 ${k}`} stroke="#ddd5c3" strokeWidth={2} />
      ))}
      <ellipse cx={880} cy={1000} rx={260} ry={34} fill="#f8f2e4" opacity={0.7} />
      <Kralice x={880} y={1000} s={0.95} t={t} el />
    </svg>
  );
};

/* ---------------- 9: Masadaki kitap ve mum ---------------- */
export const SahneKitap: React.FC<SahneProps> = ({t, olay}) => {
  const mum = 1 + Math.sin(t * 15) * 0.06 + Math.sin(t * 6.1) * 0.05;
  const sayfa = yumusak((t - (olay.sayfa ?? 1e9) - 0.15) / 0.9);
  const sx = Math.cos(sayfa * Math.PI);
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <rect width={1920} height={1080} fill="#7a4c2e" />
      <Isilti id="i9" x={1480} y={560} r={1000} renk="#f6c27a" guc={0.85 * mum} />
      {/* buzlu pencere */}
      <rect x={70} y={30} width={720} height={560} fill="#5e3b24" />
      <rect x={95} y={55} width={670} height={510} fill="#f6ecd8" />
      <path d="M 95 470 C 250 440 420 470 765 430 L 765 565 L 95 565 Z" fill="#fbf6ec" />
      <path d="M 430 55 L 430 565 M 95 310 L 765 310" stroke="#5e3b24" strokeWidth={16} />
      {[[95, 55, 0], [765, 55, 90], [95, 565, 270], [765, 565, 180]].map(([x, y, d], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${d})`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.9} strokeLinecap="round">
          <path d="M 0 0 C 40 30 70 50 120 60 M 30 22 L 40 -2 M 60 40 L 74 14 M 90 52 L 104 30 M 30 22 L 12 46 M 60 40 L 46 70 M 0 0 C 26 46 40 80 46 130 M 18 50 L -4 62 M 30 84 L 8 98" />
        </g>
      ))}
      <rect x={60} y={590} width={740} height={20} fill="#4a2e1c" />
      {/* masa */}
      <rect x={0} y={640} width={1920} height={440} fill="#7b4a2b" />
      <rect x={0} y={630} width={1920} height={16} fill="#94603a" />
      {[700, 780, 870, 960, 1040].map((k) => (
        <path key={k} d={`M 0 ${k} Q 480 ${k - 12} 960 ${k} T 1920 ${k}`} stroke="#6a3e23" strokeWidth={2.5} fill="none" opacity={0.7} />
      ))}
      {/* kapalı eski kitap */}
      <g transform="translate(300 860) rotate(-8)">
        <rect x={-170} y={-60} width={340} height={120} rx={8} fill="#6b3a22" />
        <rect x={-170} y={40} width={340} height={20} fill="#efe2c4" />
        <rect x={-120} y={-40} width={240} height={60} rx={6} fill="none" stroke="#d9b04a" strokeWidth={4} />
        <circle r={14} fill="none" stroke="#d9b04a" strokeWidth={3} cy={-10} />
      </g>
      {/* açık kitap */}
      <g>
        <ellipse cx={960} cy={900} rx={460} ry={40} fill="#4a2a18" opacity={0.4} />
        <path d="M 540 880 Q 760 850 960 900 L 960 690 Q 760 630 560 660 Z" fill="#f5ecd6" />
        <path d="M 1380 880 Q 1160 850 960 900 L 960 690 Q 1160 630 1360 660 Z" fill="#f2e7cf" />
        <path d="M 930 690 L 960 690 L 960 900 L 930 890 Z" fill="#d9c9a6" opacity={0.6} />
        {/* sol sayfa: kalem çizimi saray ve soru işaretli boş çerçeve */}
        <g stroke="#8a6a4a" strokeWidth={2.5} fill="none">
          <path d="M 640 760 L 640 720 L 652 696 L 664 720 L 664 760 M 680 760 L 680 700 L 696 664 L 712 700 L 712 760 M 728 760 L 728 724 L 740 702 L 752 724 L 752 760 M 620 760 L 772 760" />
        </g>
        <rect x={800} y={700} width={120} height={140} fill="none" stroke="#a5866a" strokeWidth={2.5} strokeDasharray="8 6" />
        <text x={860} y={796} textAnchor="middle" fontFamily="DejaVu Serif" fontSize={64} fill="#a5866a">?</text>
        {[790, 812, 834].map((k) => (
          <line key={k} x1={610} y1={k} x2={770} y2={k - 4} stroke="#b09a7c" strokeWidth={3} opacity={0.6} />
        ))}
        {/* sağ sayfa: yazı satırları */}
        <text x={1010} y={738} fontFamily="DejaVu Serif" fontWeight={700} fontSize={46} fill="#b03a2e">K</text>
        {Array.from({length: 7}, (_, i) => (
          <line key={i} x1={i < 2 ? 1050 : 1000} y1={712 + i * 24} x2={1320 - (i % 3) * 20} y2={704 + i * 24 - i * 1.5} stroke="#9a876a" strokeWidth={3} opacity={0.6} />
        ))}
        {/* dönen sayfa */}
        {sayfa > 0 && sayfa < 1 ? (
          <g transform={`translate(960 0) scale(${sx} 1) translate(-960 0)`}>
            <path d="M 1380 880 Q 1160 850 960 900 L 960 690 Q 1160 630 1360 660 Z" fill={sx > 0 ? '#f7eedb' : '#efe3c8'} stroke="#d9c9a6" strokeWidth={1.5} />
          </g>
        ) : null}
      </g>
      {/* mum */}
      <g transform="translate(1520 780)">
        <ellipse cx={0} cy={0} rx={70} ry={18} fill="#b8862e" />
        <ellipse cx={0} cy={-6} rx={56} ry={13} fill="#d9a744" />
        <rect x={-24} y={-190} width={48} height={184} fill="#f5ecd6" />
        <rect x={6} y={-190} width={18} height={184} fill="#ddd0b4" />
        <path d="M -24 -190 Q -30 -170 -20 -150 L -14 -190 Z" fill="#f8f1df" />
        <line x1={0} y1={-190} x2={0} y2={-200} stroke="#3a2a1a" strokeWidth={3} />
        <g transform={`translate(0 -198) scale(${mum} ${mum})`}>
          <path d="M 0 -58 C 14 -34 16 -10 0 0 C -16 -10 -14 -34 0 -58 Z" fill="#ffc94f" />
          <path d="M 0 -36 C 7 -22 7 -8 0 -3 C -7 -8 -7 -22 0 -36 Z" fill="#fff6d6" />
        </g>
      </g>
      {/* elma ve çam dalı */}
      <g transform="translate(1720 900)">
        <circle cx={-16} r={52} fill="#c22b26" />
        <circle cx={18} r={50} fill="#b2241f" />
        <ellipse cx={-30} cy={-18} rx={14} ry={20} fill="#e66a5c" opacity={0.6} />
        <path d="M 0 -46 Q 4 -66 12 -74" stroke="#5a3a20" strokeWidth={5} fill="none" />
        <path d="M 10 -66 C 30 -84 50 -74 54 -66 C 40 -60 24 -60 10 -66 Z" fill="#5f8a46" />
      </g>
      <g transform="translate(1260 1010) rotate(-12)" stroke="#3f6b3a" strokeWidth={4} strokeLinecap="round">
        <line x1={0} y1={0} x2={300} y2={0} stroke="#6a4a2a" strokeWidth={6} />
        {Array.from({length: 24}, (_, i) => (
          <g key={i}>
            <line x1={i * 12} y1={0} x2={i * 12 + 18} y2={-30} />
            <line x1={i * 12} y1={0} x2={i * 12 + 18} y2={30} />
          </g>
        ))}
        <circle cx={250} cy={22} r={10} fill="#b81c27" stroke="none" />
        <circle cx={268} cy={14} r={10} fill="#c8323a" stroke="none" />
      </g>
    </svg>
  );
};

export const SAHNELER: Record<number, React.FC<SahneProps>> = {
  1: SahneSaray,
  2: SahneKopenhag,
  3: SahneAtolye,
  4: SahneAyna,
  5: SahneBahce,
  6: SahneYolculuk,
  8: SahneSalon,
  9: SahneKitap,
};
