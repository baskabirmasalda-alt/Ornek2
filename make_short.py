"""'Başka Bir Masalda' kanalı için 20 saniyelik YouTube Shorts üretici.

Kullanım: python3 make_short.py  ->  baska_bir_masalda_short_01.mp4
Gereksinimler: Pillow, numpy, ffmpeg
"""
import math
import random
import subprocess
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS, DUR = 1080, 1920, 30, 20.0
N = int(FPS * DUR)
SR = 44100
OUT = "baska_bir_masalda_short_01.mp4"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
random.seed(7)

# (başlangıç, bitiş, metin, renk)
CAPTIONS = [
    (0.2, 3.6, "Kırmızı Başlıklı Kız'ı\nherkes bilir...", (255, 255, 255)),
    (3.8, 7.2, "Ama başka\nbir masalda...", (255, 214, 120)),
    (7.4, 11.2, "Kurt, büyükanneyi\nyemeye gitmiyordu.", (255, 255, 255)),
    (11.4, 15.2, "Ona ilaç\ngötürüyordu.", (150, 255, 190)),
    (15.4, 18.2, "Peki o zaman...\nkötü olan kimdi?", (255, 90, 90)),
    (18.3, 20.0, "Devamı için\nTAKİP ET", (255, 214, 120)),
]


# ---------------------------------------------------------------- görseller
def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def make_sky():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    top, mid, bot = (6, 8, 30), (34, 20, 70), (90, 40, 90)
    for y in range(H):
        t = y / H
        c = lerp(top, mid, t / 0.6) if t < 0.6 else lerp(mid, bot, (t - 0.6) / 0.4)
        d.line([(0, y), (W, y)], fill=c)
    return img.convert("RGBA")


def make_moon():
    size = 700
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = size // 2
    d.ellipse([c - 260, c - 260, c + 260, c + 260], fill=(255, 240, 200, 70))
    img = img.filter(ImageFilter.GaussianBlur(60))
    d = ImageDraw.Draw(img)
    d.ellipse([c - 150, c - 150, c + 150, c + 150], fill=(255, 246, 220, 255))
    for ox, oy, r in [(-50, -30, 30), (40, 50, 22), (60, -60, 15), (-20, 70, 12)]:
        d.ellipse([c + ox - r, c + oy - r, c + ox + r, c + oy + r], fill=(235, 222, 190, 255))
    return img


def pine(d, x, base, h, color):
    w = h * 0.42
    for i in range(4):
        top = base - h + i * h * 0.18
        bw = w * (0.45 + i * 0.2)
        d.polygon([(x, top), (x - bw, top + h * 0.38), (x + bw, top + h * 0.38)], fill=color)
    d.rectangle([x - w * 0.06, base - h * 0.1, x + w * 0.06, base], fill=color)


def make_trees(width, base, hmin, hmax, color, count):
    img = Image.new("RGBA", (width, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for _ in range(count):
        x = random.uniform(0, width)
        pine(d, x, base + random.uniform(-30, 30), random.uniform(hmin, hmax), color)
    d.rectangle([0, base, width, H], fill=color)
    return img


def make_glow(r, color):
    s = r * 6
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([s / 2 - r * 2, s / 2 - r * 2, s / 2 + r * 2, s / 2 + r * 2], fill=color + (110,))
    img = img.filter(ImageFilter.GaussianBlur(r))
    d = ImageDraw.Draw(img)
    d.ellipse([s / 2 - r / 2, s / 2 - r / 2, s / 2 + r / 2, s / 2 + r / 2], fill=(255, 255, 230, 255))
    return img


def make_girl():
    img = Image.new("RGBA", (300, 460), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(150, 60), (40, 420), (260, 420)], fill=(200, 20, 40))  # pelerin
    d.polygon([(150, 60), (95, 200), (205, 200)], fill=(170, 10, 30))
    d.ellipse([105, 95, 195, 185], fill=(250, 214, 180))  # yüz
    d.pieslice([90, 70, 210, 200], 180, 360, fill=(200, 20, 40))  # başlık
    d.ellipse([128, 130, 140, 142], fill=(40, 20, 20))
    d.ellipse([160, 130, 172, 142], fill=(40, 20, 20))
    d.arc([135, 145, 165, 168], 20, 160, fill=(150, 50, 50), width=3)
    d.rectangle([110, 420, 128, 455], fill=(30, 20, 20))
    d.rectangle([172, 420, 190, 455], fill=(30, 20, 20))
    d.arc([200, 230, 290, 330], 180, 360, fill=(120, 80, 40), width=8)  # sepet
    d.rectangle([200, 280, 290, 345], fill=(150, 100, 50))
    d.rectangle([205, 268, 285, 285], fill=(240, 240, 240))
    return img


def make_wolf():
    """Feneri olan iyi kalpli kurt silueti."""
    img = Image.new("RGBA", (520, 420), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    col = (25, 22, 40)
    d.ellipse([120, 170, 420, 330], fill=col)  # gövde
    d.polygon([(130, 230), (60, 140), (150, 120), (210, 200)], fill=col)  # boyun
    d.ellipse([20, 70, 170, 190], fill=col)  # kafa
    d.polygon([(30, 140), (-10, 170), (40, 175)], fill=col)  # burun
    d.polygon([(70, 90), (85, 20), (115, 85)], fill=col)  # kulaklar
    d.polygon([(115, 85), (140, 25), (155, 95)], fill=col)
    d.polygon([(410, 230), (510, 160), (500, 200), (420, 270)], fill=col)  # kuyruk
    for x in (150, 210, 320, 380):
        d.rectangle([x, 300, x + 28, 410], fill=col)
    d.ellipse([60, 115, 82, 133], fill=(255, 220, 90))  # göz
    # fener
    d.line([(40, 175), (40, 240)], fill=(80, 70, 60), width=5)
    d.rectangle([22, 240, 58, 290], fill=(255, 200, 90))
    return img


SKY = make_sky()
STARS = [(random.uniform(0, W), random.uniform(0, H * 0.55), random.uniform(1, 3.2),
          random.uniform(0, 6.28), random.uniform(1, 4)) for _ in range(220)]
MOON = make_moon()
FAR = make_trees(W + 300, int(H * 0.70), 300, 520, (40, 24, 70, 255), 26)
MID = make_trees(W + 500, int(H * 0.78), 420, 700, (22, 14, 42, 255), 18)
NEAR = make_trees(W + 800, int(H * 0.90), 650, 1050, (8, 6, 16, 255), 9)
GLOW = make_glow(6, (255, 230, 120))
EYE = make_glow(13, (255, 200, 60))
LANTERN = make_glow(30, (255, 190, 80))
GIRL = make_girl()
WOLF = make_wolf().resize((780, 630), Image.LANCZOS)
FIREFLIES = [(random.uniform(0, W), random.uniform(H * 0.35, H * 0.85),
              random.uniform(0.3, 1.2), random.uniform(0, 6.28)) for _ in range(35)]


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def text_layer(txt, color, size):
    font = ImageFont.truetype(FONT_BOLD, size)
    lines = txt.split("\n")
    img = Image.new("RGBA", (W, (size + 30) * len(lines) + 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, line in enumerate(lines):
        tw = d.textlength(line, font=font)
        d.text(((W - tw) / 2, 20 + i * (size + 30)), line, font=font, fill=color,
               stroke_width=8, stroke_fill=(0, 0, 0))
    return img


CAP_IMGS = [text_layer(t, c, 92) for _, _, t, c in CAPTIONS]
BRAND = text_layer("✦ Başka Bir Masalda ✦", (255, 214, 120), 52)


def paste(base, img, x, y, alpha=1.0):
    if alpha < 1.0:
        img = img.copy()
        img.putalpha(img.getchannel("A").point(lambda a: int(a * alpha)))
    base.alpha_composite(img, (int(x), int(y)))


def render(i):
    t = i / FPS
    f = SKY.copy()
    d = ImageDraw.Draw(f)
    for x, y, r, ph, sp in STARS:
        a = 0.5 + 0.5 * math.sin(ph + t * sp)
        c = int(120 + 135 * a)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(c, c, min(255, c + 20)))
    paste(f, MOON, 560 - t * 4, -40 + t * 2)

    pan = t / DUR
    paste(f, FAR, -pan * 300, 0)
    paste(f, MID, -pan * 500, 0)

    paste(f, NEAR, -pan * 800, 0)

    # Sahne 1-2: kız yürüyor
    if t < 7.6:
        gx = -320 + smooth(t / 6.5) * 640
        bob = abs(math.sin(t * 6)) * 14
        paste(f, GIRL, gx, H * 0.90 - 450 - bob, 1 - smooth((t - 7.0) / 0.6))
    # Sahne 3: ağaçların arasında parlayan gözler
    if 7.0 < t < 11.4:
        a = smooth((t - 7.3) / 0.8) * (1 - smooth((t - 10.8) / 0.6))
        blink = 0.0 if (t % 2.2) < 0.12 else 1.0
        for ex, ey in [(300, 1350), (760, 1250), (540, 1500)]:
            paste(f, EYE, ex - 85, ey - 39, a * blink)
            paste(f, EYE, ex + 7, ey - 39, a * blink)
    # Sahne 4: kurt fenerle ilaç götürüyor
    if 11.0 < t < 15.6:
        a = smooth((t - 11.2) / 0.6) * (1 - smooth((t - 15.0) / 0.6))
        wx = 1150 - smooth((t - 11.0) / 4.5) * 900
        bob = abs(math.sin(t * 5)) * 10
        wy = H * 0.90 - 600 - bob
        paste(f, LANTERN, wx + 60 - 90, wy + 400 - 90, a)
        paste(f, WOLF, wx, wy, a)


    for x, y, sp, ph in FIREFLIES:
        fx = (x + math.sin(t * sp + ph) * 80 + t * 12) % W
        fy = y + math.cos(t * sp * 1.3 + ph) * 60
        paste(f, GLOW, fx - 18, fy - 18, 0.4 + 0.6 * abs(math.sin(t * 2 + ph)))

    # Sahne 5: kırmızı gerilim
    if 15.2 < t < 18.3:
        a = smooth((t - 15.2) / 0.5) * (1 - smooth((t - 17.9) / 0.4))
        pulse = 0.5 + 0.5 * math.sin(t * 9)
        f.alpha_composite(Image.new("RGBA", (W, H), (120, 0, 10, int(90 * a * (0.6 + 0.4 * pulse)))))

    # vinyet
    f.alpha_composite(VIGNETTE)

    for (s, e, _, _), img in zip(CAPTIONS, CAP_IMGS):
        if s <= t <= e:
            a = smooth((t - s) / 0.35) * (1 - smooth((t - (e - 0.25)) / 0.25))
            sc = 0.85 + 0.15 * smooth((t - s) / 0.3)
            im = img.resize((int(img.width * sc), int(img.height * sc)), Image.LANCZOS)
            paste(f, im, (W - im.width) / 2, H * 0.40 - im.height / 2, a)
    paste(f, BRAND, 0, 150, 0.9)

    # başlangıç/bitiş geçişleri
    if t < 0.4:
        f.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * (1 - t / 0.4)))))
    return f.convert("RGB")


def make_vignette():
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W * 0.7)) ** 2 + ((yy - H / 2) / (H * 0.65)) ** 2)
    a = np.clip((r - 0.55) * 1.6, 0, 1) * 200
    arr = np.zeros((H, W, 4), np.uint8)
    arr[..., 3] = a.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


VIGNETTE = make_vignette()


# ---------------------------------------------------------------- müzik
def music():
    n = int(SR * DUR)
    t = np.arange(n) / SR
    out = np.zeros(n)

    def note(freq, start, length=1.6, vol=0.22):
        s = int(start * SR)
        e = min(n, s + int(length * SR))
        tt = np.arange(e - s) / SR
        env = np.exp(-tt * 3.2) * np.minimum(1, tt * 200)
        w = np.sin(2 * np.pi * freq * tt) + 0.3 * np.sin(4 * np.pi * freq * tt) + 0.1 * np.sin(6 * np.pi * freq * tt)
        out[s:e] += vol * env * w

    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    # Müzik kutusu: La minör, gizemli masal havası
    melody = [76, 72, 69, 72, 76, 79, 77, 76, 74, 71, 67, 71, 74, 77, 76, 74,
              72, 69, 64, 69, 72, 76, 75, 76, 81, 79, 77, 76, 74, 72, 71, 69]
    beat = 0.3125  # 96 BPM sekizlik
    for k in range(int(DUR / beat)):
        m = melody[k % len(melody)]
        if 15.2 < k * beat < 18.2:
            m -= 1  # gerilim sahnesinde detone
        note(hz(m), k * beat, vol=0.16 if k % 2 else 0.21)

    # Pad akorları (Am - F - C - G - Am)
    chords = [(57, 60, 64), (53, 57, 60), (48, 55, 60), (55, 59, 62), (57, 60, 64)]
    for ci, ch in enumerate(chords):
        s, e = int(ci * 4 * SR), int(min(DUR, (ci + 1) * 4) * SR)
        tt = np.arange(e - s) / SR
        env = np.minimum(1, tt / 0.8) * np.minimum(1, (tt[::-1]) / 0.8)
        for m in ch:
            out[s:e] += 0.05 * env * np.sin(2 * np.pi * hz(m - 12) * tt)

    # Kurt sahnesinde derin drone
    s, e = int(7.2 * SR), int(18.2 * SR)
    tt = np.arange(e - s) / SR
    env = np.minimum(1, tt / 1.5) * np.minimum(1, tt[::-1] / 1.0)
    out[s:e] += 0.09 * env * np.sin(2 * np.pi * 55 * tt) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.5 * tt))

    # Geçiş "whoosh" efektleri
    rng = np.random.default_rng(1)
    for st in [3.6, 7.2, 11.2, 15.2, 18.2]:
        s = int((st - 0.4) * SR)
        L = int(0.7 * SR)
        noise = rng.standard_normal(L)
        noise = np.convolve(noise, np.ones(40) / 40, mode="same")
        env = np.sin(np.linspace(0, np.pi, L)) ** 2
        out[s:s + L] += 0.5 * noise * env

    # basit yankı
    dl = int(0.28 * SR)
    out[dl:] += 0.3 * out[:-dl]
    out *= np.minimum(1, t / 0.3) * np.minimum(1, (DUR - t) / 0.6)
    out = out / np.max(np.abs(out)) * 0.85
    pcm = (out * 32767).astype(np.int16)
    stereo = np.stack([pcm, pcm], axis=1)
    with wave.open("music.wav", "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(stereo.tobytes())


def main():
    music()
    proc = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", "music.wav",
         "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT],
        stdin=subprocess.PIPE)
    for i in range(N):
        proc.stdin.write(render(i).tobytes())
        if i % 60 == 0:
            print(f"kare {i}/{N}")
    proc.stdin.close()
    proc.wait()
    print("Bitti:", OUT)


if __name__ == "__main__":
    main()
