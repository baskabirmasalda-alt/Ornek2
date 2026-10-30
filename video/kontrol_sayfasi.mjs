// Render almadan önce kontrol: her planın ortasından (ve olay anlarından) bir kare alır, tek sayfada toplar.
// Kullanım: node kontrol_sayfasi.mjs <Kompozisyon> src/veri/X.json cikti.jpg [ek_saniyeler...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const [, , id, veriYolu, cikti, ...ekler] = process.argv;
const veri = JSON.parse(fs.readFileSync(veriYolu, 'utf8'));
const varsayilan = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const tarayici = process.env.REMOTION_CHROME ?? (fs.existsSync(varsayilan) ? varsayilan : null);
const anlar = veri.planlar.map((p, i) => ({t: (p.bas + p.bit) / 2, ad: `${i + 1}. plan · sahne ${p.sahne} · ${p.hareket}`}));
for (const e of ekler) anlar.push({t: Number(e), ad: `ek ${e} sn`});
const serve = await bundle({entryPoint: path.resolve('src/Root.tsx')});
const comp = await selectComposition({serveUrl: serve, id, browserExecutable: tarayici ?? undefined});
const klasor = fs.mkdtempSync(path.join(process.env.TMPDIR ?? '/tmp', 'kare-'));
const kareler = [];
for (const [i, a] of anlar.entries()) {
  const dosya = path.join(klasor, `k${String(i).padStart(2, '0')}.png`);
  await renderStill({composition: comp, serveUrl: serve, output: dosya, frame: Math.round(a.t * comp.fps), scale: 0.5, browserExecutable: tarayici ?? undefined});
  kareler.push({dosya, ad: `${a.ad} · ${a.t.toFixed(1)} sn`});
  console.log('kare', i + 1, '/', anlar.length);
}
fs.writeFileSync(path.join(klasor, 'liste.json'), JSON.stringify(kareler));
execFileSync('python3', ['-c', `
import json,sys
from PIL import Image, ImageDraw, ImageFont
k=json.load(open(sys.argv[1])); W,H=640,360; c=4; r=(len(k)+c-1)//c
im=Image.new('RGB',(c*W,r*(H+34)),'#222'); d=ImageDraw.Draw(im)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',20)
for i,x in enumerate(k):
    a=Image.open(x['dosya']).convert('RGB').resize((W,H)); X,Y=(i%c)*W,(i//c)*(H+34)
    im.paste(a,(X,Y+34)); d.text((X+8,Y+6),x['ad'],fill='#ffd650',font=f)
im.save(sys.argv[2],quality=88)
`, path.join(klasor, 'liste.json'), cikti]);
console.log('kontrol sayfası:', cikti);
