// Kurgu dosyasını (plan/kurgu_*.json, make_v2.py biçimi) Remotion'un okuyacağı zamanlı JSON'a çevirir.
// Kullanım: node hazirla.mjs ../plan/kurgu_b05_pilot.json src/veri/b05_pilot.json
import fs from 'node:fs';
import path from 'node:path';

const [, , girdi, cikti] = process.argv;
const kok = path.resolve(path.dirname(girdi), '..');
const k = JSON.parse(fs.readFileSync(girdi, 'utf8'));
let words = JSON.parse(fs.readFileSync(path.join(kok, k.kelimeler), 'utf8'));
if (!Array.isArray(words)) words = words.words;
words = words.filter((w) => (w.type ?? 'word') === 'word' && !w.text.startsWith('['));
const norm = (s) => s.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]/gu, '');
const n = words.map((w) => norm(w.text));

function bul(ifade) {
  let kac = 1;
  if (ifade.includes('@')) [ifade, kac] = [ifade.split('@')[0], Number(ifade.split('@')[1])];
  const h = ifade.split(/\s+/).map(norm).filter(Boolean);
  let say = 0;
  for (let i = 0; i + h.length <= n.length; i++) {
    if (h.every((x, j) => n[i + j] === x || (x.length >= 4 && n[i + j].startsWith(x)))) {
      if (++say === kac) return words[i].start;
    }
  }
  throw new Error('bulunamadı: ' + ifade);
}

const sure = words[words.length - 1].end + (k.son_bosluk ?? 2);
const planlar = k.planlar.map((p, i) => ({...p, bas: i ? bul(p.bas) - 0.05 : 0}));
planlar.forEach((p, i) => (p.bit = i + 1 < planlar.length ? planlar[i + 1].bas : sure));
const vurgular = (k.vurgular ?? []).map((v) => ({
  bas: bul(v.bas),
  sure: v.sure ?? 1.6,
  satirlar: v.metin.split('/').map((s) => ({metin: s.split(';').map((p) => p.split('|')[0]).join(''), renk: s.split(';')[0].split('|')[1] ?? 'beyaz'})),
}));
const rel = (p) => (p ? p.replace(/^assets\//, 'assets/') : null);
fs.writeFileSync(cikti, JSON.stringify({
  sure, ses: rel(k.ses), muzik: rel(k.muzik), sahneler: k.sahneler.replace(/^assets\//, 'assets/'),
  planlar, vurgular, kelimeler: words.map(({text, start, end}) => ({text, start, end})),
}, null, 1));
console.log('yazıldı:', cikti, sure.toFixed(1), 'sn,', planlar.length, 'plan');
