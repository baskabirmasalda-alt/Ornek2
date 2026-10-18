"""Başka Bir Masalda – uzun yatay video (16:9, 1920x1080), 2. bölümden itibaren.

Senaryodaki her `### ` başlığı bir bölüm, her `[SAHNE n: ...]` işareti o satırdan sonraki anlatımda
gösterilecek görseldir. Anlatım parçaları GROUPS ile bölümlerden birleştirilir.

Girdiler: assets/bNN/ses/p1..pK.mp3, assets/bNN/sahneler/sNN.png, plan/senaryo_epNN_uzun.md
Kullanım: BOLUM=2 python3 make_uzun.py  ->  baska_bir_masalda_bNN_uzun.mp4
"""
import os
import re
import subprocess
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFont

BOLUM = int(os.environ.get("BOLUM", "2"))
B = f"b{BOLUM:02d}"
W, H, FPS = 1920, 1080, 30
SR = 44100
OUT = f"baska_bir_masalda_{B}_uzun.mp4"
SES = f"assets/{B}/ses"
SAHNE = f"assets/{B}/sahneler"
SENARYO = f"plan/senaryo_ep{BOLUM:02d}_uzun.md"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
INTRO, GAP, OUTRO = 1.0, 0.6, 4.0  # saniye
XF = 0.8  # sahne geçişi
GROUPS = [[0, 1], [2], [3], [4], [5], [6]]  # hangi ### bölümleri hangi anlatım parçasında


def part_lines():
    """Her anlatım parçası için [(satır, sahne no), ...]."""
    s = open(SENARYO, encoding="utf-8").read().split("---")[1]
    secs = re.split(r"^### ", s, flags=re.M)[1:]
    out, sc = [], 0
    for g in GROUPS:
        lines = []
        for i in g:
            for l in secs[i].split("\n")[1:]:
                l = l.strip()
                m = re.match(r"\[SAHNE (\d+):", l)
                if m:
                    sc = int(m.group(1))
                elif l and not l.startswith("["):
                    lines.append((l, sc))
        out.append(lines)
    return out


def duration(path):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]))


def build_timeline():
    """Sahne aralıkları ve alt yazı aralıkları (saniye)."""
    lines = part_lines()
    t = INTRO
    scenes, subs, starts = [], [], []
    for p, pl in enumerate(lines):
        d = duration(f"{SES}/p{p + 1}.mp3")
        starts.append(t)
        total = sum(len(l) for l, _ in pl)
        cur = t
        for line, sc in pl:
            ld = d * len(line) / total
            if scenes and scenes[-1][2] == sc:
                scenes[-1][1] = cur + ld
            else:
                scenes.append([cur, cur + ld, sc])
            # satırı cümlelere böl, cümle sürelerini uzunluğa göre dağıt
            sents = [x.strip() for x in re.split(r"(?<=[.!?…])\s+", line) if x.strip()]
            st = sum(len(x) for x in sents)
            c2 = cur
            for x in sents:
                sd = ld * len(x) / st
                subs.append((c2, c2 + sd, x))
                c2 += sd
            cur += ld
        t += d + GAP
    total = t - GAP + OUTRO
    scenes[-1][1] = total
    for i in range(1, len(scenes)):  # boşlukları önceki sahneyle kapat
        scenes[i - 1][1] = scenes[i][0]
    scenes[0][0] = 0
    return scenes, subs, starts, total


SCENES, SUBS, STARTS, TOTAL = build_timeline()
N = int(TOTAL * FPS)

# ------------------------------------------------------------ görseller
IMGS = {}
for _, _, sc in SCENES:
    if sc not in IMGS:
        im = Image.open(f"{SAHNE}/s{sc:02d}.png").convert("RGB")
        w, h = im.size
        m = 0.03  # kâğıt kenarlarını kırp
        im = im.crop((int(w * m), int(h * m), int(w * (1 - m)), int(h * (1 - m))))
        IMGS[sc] = im.resize((int(im.width * 2), int(im.height * 2)), Image.LANCZOS)  # büyük kaynak


def kenburns(sc, k, u):
    """k: sahne sırası (hareket yönü), u: 0..1 ilerleme."""
    im = IMGS[sc]
    iw, ih = im.size
    base_h = iw * 9 / 16
    if base_h > ih:
        bw, bh = ih * 16 / 9, ih
    else:
        bw, bh = iw, base_h
    zin = k % 2 == 0
    z = 1.0 + 0.12 * (u if zin else 1 - u)
    cw, ch = bw / z, bh / z
    dx = [(-1, 0), (1, 0), (0, -1), (0, 1)][k % 4]
    cx = iw / 2 + dx[0] * (bw - cw) / 2 * (u - 0.5) * 1.6
    cy = ih / 2 + dx[1] * (bh - ch) / 2 * (u - 0.5) * 1.6
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return im.resize((W, H), Image.BILINEAR, box=box)


def make_vignette():
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
    a = np.clip((r - 0.62) * 1.4, 0, 1) * 150
    arr = np.zeros((H, W, 4), np.uint8)
    arr[..., 3] = a.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


VIGNETTE = make_vignette()
SUBFONT = ImageFont.truetype(FONT, 46)
BRANDFONT = ImageFont.truetype(FONT, 28)


def wrap(text, maxw, d):
    words, lines, cur = text.split(), [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if d.textlength(test, font=SUBFONT) > maxw and cur:
            lines.append(cur)
            cur = w
        else:
            cur = test
    return lines + [cur]


SUB_CACHE = {}


def sub_layer(text):
    if text not in SUB_CACHE:
        tmp = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
        lines = wrap(text, W * 0.72, tmp)
        lh = 60
        img = Image.new("RGBA", (W, lh * len(lines) + 40), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        for i, line in enumerate(lines):
            tw = d.textlength(line, font=SUBFONT)
            d.text(((W - tw) / 2, 20 + i * lh), line, font=SUBFONT, fill=(255, 250, 235),
                   stroke_width=5, stroke_fill=(15, 10, 20))
        SUB_CACHE[text] = img
    return SUB_CACHE[text]


BRAND = Image.new("RGBA", (420, 50), (0, 0, 0, 0))
ImageDraw.Draw(BRAND).text((0, 8), "✦ Başka Bir Masalda", font=BRANDFONT, fill=(255, 220, 140, 170),
                           stroke_width=2, stroke_fill=(0, 0, 0, 120))


def smooth(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def render(i):
    t = i / FPS
    k = next(j for j, (s, e, _) in enumerate(SCENES) if s <= t < e or j == len(SCENES) - 1)
    s, e, sc = SCENES[k]
    f = kenburns(sc, k, (t - s) / (e - s))
    if k > 0 and t < s + XF:
        ps, pe, psc = SCENES[k - 1]
        prev = kenburns(psc, k - 1, min(1.0, (t - ps) / (pe - ps)))
        f = Image.blend(prev, f, smooth((t - s) / XF))
    f = f.convert("RGBA")
    f.alpha_composite(VIGNETTE)
    for a, b, text in SUBS:
        if a <= t < b:
            lay = sub_layer(text)
            alpha = smooth((t - a) / 0.15) * (1 - smooth((t - b + 0.1) / 0.1))
            if alpha < 1:
                lay = lay.copy()
                lay.putalpha(lay.getchannel("A").point(lambda v: int(v * alpha)))
            f.alpha_composite(lay, (0, H - lay.height - 40))
            break
    f.alpha_composite(BRAND, (40, 30))
    if t < INTRO:
        f.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * (1 - t / INTRO)))))
    if t > TOTAL - 1.5:
        f.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * smooth((t - TOTAL + 1.5) / 1.5)))))
    return f.convert("RGB")


# ------------------------------------------------------------ ses
def ambient(total):
    """Yavaş akorlarla yumuşak masal fonu + seyrek müzik kutusu notaları."""
    n = int(SR * total)
    t = np.arange(n) / SR
    out = np.zeros(n)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    chords = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]  # Am F C G
    seg = 8.0
    for ci in range(int(total / seg) + 1):
        ch = chords[ci % 4]
        s0, s1 = int(ci * seg * SR), min(n, int((ci + 1) * seg * SR + SR))
        tt = np.arange(s1 - s0) / SR
        env = np.minimum(1, tt / 2.0) * np.minimum(1, (tt[::-1]) / 2.0)
        for m in ch:
            out[s0:s1] += 0.05 * env * (np.sin(2 * np.pi * hz(m - 12) * tt) + 0.3 * np.sin(2 * np.pi * hz(m) * tt))
        rng = np.random.default_rng(ci)
        for _ in range(3):  # seyrek müzik kutusu
            st = s0 + int(rng.uniform(0, seg) * SR)
            L = min(n - st, int(1.5 * SR))
            if L <= 0:
                continue
            tt2 = np.arange(L) / SR
            m = ch[rng.integers(0, 3)] + 12
            out[st:st + L] += 0.06 * np.exp(-tt2 * 3) * np.sin(2 * np.pi * hz(m) * tt2)
    dl = int(0.3 * SR)
    out[dl:] += 0.35 * out[:-dl]
    out *= np.minimum(1, t / 2) * np.minimum(1, (total - t) / 3)
    out = out / np.max(np.abs(out)) * 0.8
    pcm = (out * 32767).astype(np.int16)
    with wave.open(f"{B}_muzik.wav", "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())


def voice_track():
    inputs, filt = [], []
    for p, st in enumerate(STARTS):
        inputs += ["-i", f"{SES}/p{p + 1}.mp3"]
        ms = int(st * 1000)
        filt.append(f"[{p}:a]aresample={SR},adelay={ms}|{ms}[v{p}]")
    mix = "".join(f"[v{p}]" for p in range(len(STARTS)))
    filt.append(f"{mix}amix=inputs={len(STARTS)}:normalize=0,apad=whole_dur={TOTAL}[out]")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filt),
                    "-map", "[out]", "-t", str(TOTAL), "-ac", "1", f"{B}_ses.wav"], check=True)


def main():
    print(f"süre {TOTAL:.1f} sn, {len(SCENES)} sahne geçişi, {len(SUBS)} alt yazı")
    ambient(TOTAL)
    voice_track()
    proc = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-i", f"{B}_ses.wav", "-i", f"{B}_muzik.wav",
         "-filter_complex",
         "[2:a]volume=0.22[m];[1:a][m]amix=inputs=2:duration=first:normalize=0,"
         "loudnorm=I=-14:TP=-1.5:LRA=11[a]",
         "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-t", str(TOTAL),
         "-movflags", "+faststart", OUT],
        stdin=subprocess.PIPE)
    for i in range(N):
        proc.stdin.write(render(i).tobytes())
        if i % 900 == 0:
            print(f"kare {i}/{N}", flush=True)
    proc.stdin.close()
    proc.wait()
    print("Bitti:", OUT)


if __name__ == "__main__":
    main()
