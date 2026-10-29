"""Yeni tempo render aracı (5. bölümden itibaren): kelime zamanlamasına göre kesmeler, vurgu yazıları,
ses efektleri, gerçek müzik (anlatımın altında kısılır, sürprizden önce susar), kelime kelime alt yazı.

Kullanım: python3 make_v2.py plan/kurgu_b05_pilot.json
Kurgu dosyası (JSON):
  {"cikti": "...mp4", "ses": "anlatim.mp3", "kelimeler": "kelimeler.json", "muzik": "muzik.mp3",
   "ortam": "ruzgar.mp3", "sahneler": "assets/b05/sahneler", "klipler": "assets/b05/klipler",
   "planlar": [{"bas": "söz öbeği", "sahne": 1, "hareket": "yakin|uzak|sol|sag|yukari", "odak": [0.5, 0.5]}],
   "vurgular": [{"bas": "söz öbeği", "metin": "ELSA YOK|beyaz", "sure": 1.6}],
   "efektler": [{"bas": "söz öbeği", "dosya": "sfx.mp3", "ses": 0.8, "kay": -0.1}],
   "sessizlik": [{"bas": "söz öbeği", "sure": 0.9}]}
"bas" alanı anlatımdaki bir söz öbeğidir; zamanı kelime dökümünden bulunur ("söz@2" ikinci geçiş).
"""
import json
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import make_kapak as K

W, H, FPS, SR = 1920, 1080, 30, 44100
SUBF = ImageFont.truetype(K.FONT, 64)
BRANDF = ImageFont.truetype(K.FONT, 30)
XF = 0.25  # kesme geçişi (sn)


def norm(w):
    return "".join(c for c in w.lower() if c.isalnum())


class Zaman:
    """Kelime dökümünden söz öbeği -> saniye."""

    def __init__(self, words):
        self.w = [x for x in words if x.get("type", "word") == "word" and not x["text"].startswith("[")]
        self.n = [norm(x["text"]) for x in self.w]

    def bul(self, ifade, son=False):
        kac = 1
        if "@" in ifade:
            ifade, k = ifade.rsplit("@", 1)
            kac = int(k)
        hedef = [norm(x) for x in ifade.split() if norm(x)]
        bulunan = 0
        for i in range(len(self.n) - len(hedef) + 1):
            if all(self.n[i + j] == h or (len(h) >= 4 and self.n[i + j].startswith(h)) for j, h in enumerate(hedef)):
                bulunan += 1
                if bulunan == kac:
                    return self.w[i + len(hedef) - 1]["end"] if son else self.w[i]["start"]
        raise ValueError(f"bulunamadı: {ifade}")


def oku_ses(yol):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", yol, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, np.float32).copy()


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


HAREKET = {  # (başlangıç yakınlık, bitiş yakınlık, x kayma, y kayma)
    "yakin": (1.0, 1.14, 0, 0), "uzak": (1.14, 1.0, 0, 0), "sol": (1.1, 1.1, 0.06, 0),
    "sag": (1.1, 1.1, -0.06, 0), "yukari": (1.1, 1.12, 0, 0.05), "vurgu": (1.22, 1.3, 0, 0), "detay": (1.8, 1.95, 0, 0),
}


class Plan:
    def __init__(self, p, bas, bit, sahneler, klipler):
        self.bas, self.bit, self.p = bas, bit, p
        self.klip = None
        kyol = f"{klipler}/s{p['sahne']:02d}.mp4"
        if p.get("klip") and subprocess.run(["test", "-f", kyol]).returncode == 0:
            self.klip = kyol
        else:
            self.im = Image.open(f"{sahneler}/s{p['sahne']:02d}.png").convert("RGB").resize((W * 2 // 1, H * 2 // 1),
                                                                                             Image.LANCZOS)
        self.proc = None

    def kare(self, t):
        u = smooth((t - self.bas) / max(self.bit - self.bas, 0.1))
        z0, z1, dx, dy = HAREKET[self.p.get("hareket", "yakin")]
        z = z0 + (z1 - z0) * u
        ox, oy = self.p.get("odak", [0.5, 0.5])
        if self.klip:
            if self.proc is None:  # klibi plan süresine yayarak oynat
                d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                                   "-of", "csv=p=0", self.klip]))
                k = max((self.bit - self.bas + 0.5) / d, 1.0)
                self.proc = subprocess.Popen(
                    ["ffmpeg", "-v", "error", "-i", self.klip, "-vf",
                     f"setpts={k:.4f}*PTS,fps={FPS},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                    stdout=subprocess.PIPE)
                self.son = None
            b = self.proc.stdout.read(W * H * 3)
            if len(b) == W * H * 3:
                self.son = Image.frombytes("RGB", (W, H), b)
            im = self.son
            z = 1.0 + (z - 1.0) * 0.4
            iw, ih = W, H
        else:
            im = self.im
            iw, ih = im.size
        cw, ch = iw / z, ih / z
        cx = min(max(ox * iw + dx * iw * (u - 0.5), cw / 2), iw - cw / 2)
        cy = min(max(oy * ih + dy * ih * (u - 0.5), ch / 2), ih - ch / 2)
        return im.resize((W, H), Image.BILINEAR, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2))


def vurgu_katmani(metin):
    satirlar = [[tuple(p.split("|")) for p in s.split(";")] for s in metin.split("/")]
    f = ImageFont.truetype(K.FONT, 120)
    kat = [K.satir(s, f, 13) for s in satirlar]
    w = max(k.width for k in kat)
    h = sum(k.height - 20 for k in kat) + 20
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    y = 0
    for k in kat:
        out.alpha_composite(k, ((w - k.width) // 2, y))
        y += k.height - 20
    return out


def alt_yazi_obekleri(words, maks=5):
    """Kelimeleri 3-5'lik öbeklere böler; cümle sonunda öbek kapanır."""
    out, cur = [], []
    for x in words:
        if x.get("type", "word") != "word":
            continue
        cur.append(x)
        if len(cur) >= maks or x["text"].rstrip().endswith((".", "?", "!", ":", "…")):
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return out


def alt_yazi(obek, t):
    d = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    parcalar = [x["text"].strip() for x in obek]
    bosluk = d.textlength(" ", font=SUBF)
    gen = sum(d.textlength(p, font=SUBF) for p in parcalar) + bosluk * (len(parcalar) - 1)
    img = Image.new("RGBA", (int(gen) + 40, 100), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    x = 20
    for p, w in zip(parcalar, obek):
        renk = (255, 214, 80) if w["start"] <= t < w["end"] + 0.05 else (255, 255, 255)
        dr.text((x, 10), p, font=SUBF, fill=renk, stroke_width=7, stroke_fill=(10, 5, 15))
        x += d.textlength(p, font=SUBF) + bosluk
    return img


def kar_katmani(n=90, seed=5):
    rng = np.random.default_rng(seed)
    return rng.random((n, 4))


def main(yol):
    k = json.load(open(yol))
    words = json.load(open(k["kelimeler"]))
    if isinstance(words, dict):
        words = words["words"]
    words = [x for x in words if x.get("type", "word") == "word" and not x["text"].startswith("[")]
    Z = Zaman(words)
    ses = oku_ses(k["ses"])
    toplam = len(ses) / SR + k.get("son_bosluk", 2.0)
    n = int(toplam * SR)

    # --- planlar
    bas = [Z.bul(p["bas"]) - 0.05 if i else 0.0 for i, p in enumerate(k["planlar"])]
    planlar = [Plan(p, b, (bas[i + 1] if i + 1 < len(bas) else toplam) + XF, k["sahneler"], k["klipler"])
               for i, (p, b) in enumerate(zip(k["planlar"], bas))]
    vurgular = [(Z.bul(v["bas"]), v.get("sure", 1.6), vurgu_katmani(v["metin"])) for v in k.get("vurgular", [])]
    obekler = alt_yazi_obekleri(words)

    # --- ses: anlatım + müzik (kısılan) + ortam + efektler
    mix = np.zeros(n, np.float32)
    mix[:len(ses)] += ses
    zarf = np.abs(ses)
    pencere = int(0.25 * SR)
    zarf = np.convolve(zarf, np.ones(pencere) / pencere, "same")
    konusma = np.zeros(n, np.float32)
    konusma[:len(zarf)] = np.clip(zarf / (zarf.max() * 0.15), 0, 1)
    muzik_ses = 0.32 - 0.20 * konusma  # konuşurken kıs
    for s in k.get("sessizlik", []):  # sürprizden önce müzik susar
        t0 = Z.bul(s["bas"])
        a, b = int((t0 - s.get("sure", 0.9)) * SR), int((t0 + 0.15) * SR)
        r = int(0.12 * SR)
        muzik_ses[a:b] *= 0.04
        muzik_ses[max(a - r, 0):a] *= np.linspace(1, 0.04, min(r, a))
        muzik_ses[b:b + r * 3] *= np.linspace(0.04, 1, len(muzik_ses[b:b + r * 3]))
    if k.get("muzik"):
        m = oku_ses(k["muzik"])
        m = np.tile(m, int(np.ceil(n / len(m))))[:n]
        mix += m * muzik_ses
    if k.get("ortam"):
        o = oku_ses(k["ortam"])
        o = np.tile(o, int(np.ceil(n / len(o))))[:n]
        mix += o * k.get("ortam_ses", 0.12)
    for e in k.get("efektler", []):
        t0 = Z.bul(e["bas"]) + e.get("kay", 0.0)
        x = oku_ses(e["dosya"]) * e.get("ses", 0.7)
        a = max(int(t0 * SR), 0)
        mix[a:a + len(x)] += x[:n - a]
    for p in planlar[1:]:  # her kesmede hafif "vuuş"
        if k.get("gecis_sesi"):
            x = oku_ses(k["gecis_sesi"]) * 0.22
            a = int((p.bas - 0.15) * SR)
            mix[a:a + len(x)] += x[:n - a]
    fade = int(1.5 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix = np.clip(mix, -1, 1)
    wav = k["cikti"].replace(".mp4", "_ses.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", wav],
                   input=mix.tobytes(), check=True)

    # --- görüntü
    kar = kar_katmani()
    yy, xx = np.mgrid[0:H, 0:W]
    vin = np.clip(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2 - 0.35, 0, 1) * 150
    vin = Image.fromarray(np.dstack([np.zeros((H, W, 3), np.uint8), vin.astype(np.uint8)]), "RGBA")
    brand = Image.new("RGBA", (420, 50), (0, 0, 0, 0))
    ImageDraw.Draw(brand).text((0, 5), "✦ Başka Bir Masalda", font=BRANDF, fill=(255, 225, 160, 200))
    proc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
         "-i", "-", "-i", wav, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:v", "libx264", "-preset", "medium",
         "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart",
         k["cikti"]], stdin=subprocess.PIPE)
    for i in range(int(toplam * FPS)):
        t = i / FPS
        aktif = [p for p in planlar if p.bas <= t < p.bit]
        f = aktif[0].kare(t).convert("RGBA")
        if len(aktif) > 1:  # geçiş
            f = Image.blend(f, aktif[1].kare(t).convert("RGBA"), smooth((t - aktif[1].bas) / XF))
        # kar taneleri
        d = ImageDraw.Draw(f)
        for x0, y0, s, v in kar:
            x = (x0 * W + 40 * np.sin(t * 0.7 + v * 6)) % W
            y = (y0 * H + t * (30 + 50 * v)) % H
            r = 1 + 3 * s
            d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, int(90 + 100 * s)))
        f.alpha_composite(vin)
        for t0, sure, img in vurgular:
            if t0 <= t < t0 + sure:
                u = (t - t0)
                sc = 1.0 + 0.35 * (1 - smooth(u / 0.22))
                al = min(1, u / 0.1) * (1 - smooth((u - sure + 0.25) / 0.25))
                im2 = img.resize((int(img.width * sc), int(img.height * sc)), Image.BILINEAR)
                if al < 1:
                    im2.putalpha(im2.getchannel("A").point(lambda q: int(q * al)))
                f.alpha_composite(im2, ((W - im2.width) // 2, int(H * 0.30) - im2.height // 2))
        for ob in obekler:
            if ob[0]["start"] - 0.05 <= t < ob[-1]["end"] + 0.25:
                s = alt_yazi(ob, t)
                f.alpha_composite(s, ((W - s.width) // 2, int(H * 0.80)))
                break
        f.alpha_composite(brand, (40, 32))
        proc.stdin.write(f.convert("RGB").tobytes())
    proc.stdin.close()
    proc.wait()
    print("Bitti:", k["cikti"], f"{toplam:.1f} sn")


if __name__ == "__main__":
    main(sys.argv[1])
