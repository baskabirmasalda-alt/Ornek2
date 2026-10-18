"""'Başka Bir Masalda' Bölüm 1 (yeni sürüm): masal kitabı tarzı, ElevenLabs anlatımlı.

Girdiler: assets/ep01/kiz.png, kurt.png (karakterler.png'den kesildi), anlatim_3.mp3
Kullanım: python3 make_ep01_masal.py  ->  baska_bir_masalda_ep01_masal.mp4
"""
import math
import random
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import make_short as ms
from make_short import FONT_BOLD, FPS, H, W, paste, smooth

DUR = 20.0
N = int(FPS * DUR)
OUT = "baska_bir_masalda_ep01_masal.mp4"
VOICE = "assets/ep01/anlatim_3.mp3"
VOICE_DELAY = 0.3
random.seed(11)
np.random.seed(11)

# Anlatımdaki cümleler (sessizlik analizinden, VOICE_DELAY dahil)
PHRASES = [
    (0.30, 2.89, "Kırmızı Başlıklı Kız'ı herkes bilir..."),
    (3.54, 5.02, "Ama başka bir masalda..."),
    (5.56, 8.00, "kurt, büyükanneyi yemeye gitmiyordu."),
    (8.77, 10.20, "Boynundaki küçük şişeyle..."),
    (10.83, 11.95, "ona ilaç götürüyordu."),
    (12.65, 13.60, "Peki o zaman..."),
    (14.03, 15.73, "bu masalda kötü olan kimdi?"),
    (16.27, 18.30, "Devamı için takip et!"),
]
# Sahne sınırları (saniye)
SCENES = [(0.0, 3.3), (3.3, 6.1), (6.1, 10.5), (10.5, 12.4), (12.4, 16.1), (16.1, DUR)]
XF = 0.35  # geçiş süresi
CAM = 1.12  # kamera hareketi için arka plan büyütme oranı
BW, BH = int(W * CAM), int(H * CAM)


# ---------------------------------------------------------------- boyama yardımcıları
def paper(w, h, strength=18):
    n = np.random.normal(0, 1, (h // 4, w // 4))
    n = np.asarray(Image.fromarray(((n * 40) + 128).clip(0, 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
                   .filter(ImageFilter.GaussianBlur(2)), np.float32)
    return (n - 128) / 128 * strength


def gradient(w, h, stops):
    ys = np.linspace(0, 1, h)[:, None]
    out = np.zeros((h, w, 3), np.float32)
    for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
        m = (ys >= p0) & (ys <= p1)
        t = np.clip((ys - p0) / max(p1 - p0, 1e-6), 0, 1)
        col = np.array(c0) + (np.array(c1) - np.array(c0)) * t[..., None]
        out = np.where(m[..., None], np.broadcast_to(col, (h, w, 3)), out)
    return out


def to_img(arr, grain=True):
    if grain:
        arr = arr + paper(arr.shape[1], arr.shape[0])[..., None]
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8)).convert("RGBA")


def blob_layer(size, shapes, blur=3):
    """Suluboya etkisi: üst üste binen yumuşak lekeler."""
    lay = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for kind, box, col in shapes:
        (d.ellipse if kind == "e" else d.polygon)(box, fill=col)
    return lay.filter(ImageFilter.GaussianBlur(blur))


def tree(cx, base, h, col, rng):
    shapes = [("p", [(cx - h * .035, base), (cx + h * .035, base), (cx + h * .02, base - h * .55),
                     (cx - h * .02, base - h * .55)], col)]
    for _ in range(26):
        r = rng.uniform(.10, .19) * h
        x = cx + rng.uniform(-.2, .2) * h
        y = base - h * rng.uniform(.5, .95)
        c = tuple(int(v * rng.uniform(.85, 1.12)) for v in col[:3]) + (col[3],)
        shapes.append(("e", [x - r, y - r * .85, x + r, y + r * .85], c))
    return shapes


def forest(size, base, n, hmin, hmax, col, seed, blur=3):
    rng = random.Random(seed)
    shapes = []
    for _ in range(n):
        shapes += tree(rng.uniform(-100, size[0] + 100), base + rng.uniform(-40, 40), rng.uniform(hmin, hmax), col, rng)
    return blob_layer(size, shapes, blur)


def bushes(size, top, col, seed, count=40):
    rng = random.Random(seed)
    shapes = []
    for _ in range(count):
        r = rng.uniform(60, 150)
        x, y = rng.uniform(-50, size[0] + 50), top + rng.uniform(0, 260)
        c = tuple(int(v * rng.uniform(.8, 1.15)) for v in col[:3]) + (col[3],)
        shapes.append(("e", [x - r, y - r * .7, x + r, y + r * .7], c))
    shapes.append(("p", [(0, top + 200), (size[0], top + 200), (size[0], size[1]), (0, size[1])], col))
    return blob_layer(size, shapes, 4)


def moon(r, glow_col=(255, 240, 200)):
    s = r * 6
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = s // 2
    d.ellipse([c - r * 2.4, c - r * 2.4, c + r * 2.4, c + r * 2.4], fill=glow_col + (60,))
    img = img.filter(ImageFilter.GaussianBlur(r * .8))
    d = ImageDraw.Draw(img)
    d.ellipse([c - r, c - r, c + r, c + r], fill=(255, 247, 222, 255))
    for ox, oy, rr in [(-.3, -.2, .18), (.25, .3, .14), (.35, -.35, .09)]:
        d.ellipse([c + ox * r - rr * r, c + oy * r - rr * r, c + ox * r + rr * r, c + oy * r + rr * r],
                  fill=(240, 226, 196, 255))
    return img.filter(ImageFilter.GaussianBlur(1.5))


def stars(img, n, top_frac, seed):
    rng = random.Random(seed)
    d = ImageDraw.Draw(img)
    for _ in range(n):
        x, y, r = rng.uniform(0, img.width), rng.uniform(0, img.height * top_frac), rng.uniform(1, 3.2)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 250, 225, rng.randint(120, 255)))


def glow(r, col, a=150):
    s = r * 6
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(img).ellipse([s / 2 - r * 2, s / 2 - r * 2, s / 2 + r * 2, s / 2 + r * 2], fill=col + (a,))
    return img.filter(ImageFilter.GaussianBlur(r))


def tint(img, mul, add=(0, 0, 0)):
    a = np.asarray(img).astype(np.float32)
    a[..., :3] = a[..., :3] * np.array(mul) + np.array(add)
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), "RGBA")


def scaled(img, h):
    return img.resize((int(img.width * h / img.height), h), Image.LANCZOS)


def ground_shadow(w, h=60, a=150):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(img).ellipse([0, 0, w, h], fill=(5, 5, 15, a))
    return img.filter(ImageFilter.GaussianBlur(12))


# ---------------------------------------------------------------- sahne arka planları
SZ = (BW, BH)


def bg_dusk():
    b = to_img(gradient(BW, BH, [(0, (40, 46, 110)), (.45, (196, 110, 120)), (.62, (247, 178, 120)), (1, (60, 40, 50))]))
    stars(b, 60, .25, 1)
    paste(b, moon(110), BW * .62 - 330, BH * .12 - 330)
    b.alpha_composite(forest(SZ, int(BH * .70), 14, 600, 900, (120, 70, 110, 255), 2, 6))
    b.alpha_composite(forest(SZ, int(BH * .80), 9, 800, 1150, (70, 40, 70, 255), 3, 4))
    path = blob_layer(SZ, [("p", [(BW * .42, BH * .74), (BW * .58, BH * .74), (BW * .95, BH), (BW * .05, BH)],
                            (232, 170, 120, 255))], 10)
    b.alpha_composite(bushes(SZ, int(BH * .78), (50, 34, 55, 255), 4))
    b.alpha_composite(path)
    return b


def bg_bushes():
    b = to_img(gradient(BW, BH, [(0, (8, 12, 40)), (.5, (24, 38, 82)), (1, (8, 14, 30))]))
    stars(b, 120, .35, 5)
    paste(b, moon(80, (190, 210, 255)), BW * .2 - 240, BH * .1 - 240)
    b.alpha_composite(forest(SZ, int(BH * .72), 16, 700, 1000, (20, 34, 66, 255), 6, 6))
    b.alpha_composite(forest(SZ, int(BH * .86), 7, 1000, 1400, (10, 18, 38, 255), 7, 4))
    b.alpha_composite(bushes(SZ, int(BH * .62), (14, 34, 40, 255), 8, 60))
    return b


def bg_night_path():
    b = to_img(gradient(BW, BH, [(0, (12, 16, 52)), (.55, (46, 52, 110)), (1, (16, 20, 40))]))
    stars(b, 140, .4, 9)
    paste(b, moon(120), BW * .7 - 360, BH * .1 - 360)
    b.alpha_composite(forest(SZ, int(BH * .70), 15, 650, 950, (36, 40, 86, 255), 10, 6))
    b.alpha_composite(forest(SZ, int(BH * .80), 8, 900, 1200, (20, 24, 54, 255), 11, 4))
    b.alpha_composite(bushes(SZ, int(BH * .80), (16, 20, 40, 255), 12))
    b.alpha_composite(blob_layer(SZ, [("p", [(0, BH * .86), (BW, BH * .84), (BW, BH * .93), (0, BH * .95)],
                                       (92, 84, 120, 255))], 12))
    return b


def bg_cottage():
    b = to_img(gradient(BW, BH, [(0, (14, 18, 56)), (.6, (52, 50, 104)), (1, (20, 18, 36))]))
    stars(b, 120, .4, 13)
    paste(b, moon(90), BW * .78 - 270, BH * .12 - 270)
    b.alpha_composite(forest(SZ, int(BH * .70), 12, 600, 900, (30, 34, 74, 255), 14, 6))
    cx, base = BW * .5, BH * .80
    cw, ch = BW * .62, BH * .26
    house = [("p", [(cx - cw / 2, base), (cx + cw / 2, base), (cx + cw / 2, base - ch), (cx - cw / 2, base - ch)], (120, 84, 70, 255)),
             ("p", [(cx - cw * .62, base - ch), (cx + cw * .62, base - ch), (cx, base - ch * 1.85)], (92, 48, 50, 255)),
             ("p", [(cx + cw * .22, base - ch * 1.5), (cx + cw * .34, base - ch * 1.5), (cx + cw * .34, base - ch * 1.95),
                    (cx + cw * .22, base - ch * 1.95)], (80, 60, 60, 255)),
             ("p", [(cx + cw * .08, base), (cx + cw * .30, base), (cx + cw * .30, base - ch * .62), (cx + cw * .08, base - ch * .62)], (70, 44, 34, 255))]
    b.alpha_composite(blob_layer(SZ, house, 3))
    win = (cx - cw * .34, base - ch * .78, cx - cw * .08, base - ch * .38)
    paste(b, glow(140, (255, 180, 90), 170), (win[0] + win[2]) / 2 - 420, (win[1] + win[3]) / 2 - 420)
    d = ImageDraw.Draw(b)
    d.rectangle(win, fill=(255, 206, 120, 255))
    d.line([((win[0] + win[2]) / 2, win[1]), ((win[0] + win[2]) / 2, win[3])], fill=(90, 56, 40), width=10)
    d.line([(win[0], (win[1] + win[3]) / 2), (win[2], (win[1] + win[3]) / 2)], fill=(90, 56, 40), width=10)
    b.alpha_composite(bushes(SZ, int(BH * .80), (18, 26, 40, 255), 15, 30))
    return b


def bg_shadow():
    b = to_img(gradient(BW, BH, [(0, (10, 6, 24)), (.55, (70, 14, 34)), (1, (12, 6, 16))]))
    stars(b, 80, .3, 16)
    paste(b, tint(moon(100), (1, .75, .75)), BW * .3 - 300, BH * .1 - 300)
    b.alpha_composite(forest(SZ, int(BH * .72), 14, 650, 950, (40, 10, 30, 255), 17, 6))
    # sağda pencere ışığı (kulübe)
    paste(b, glow(120, (255, 170, 80), 140), BW * .78 - 360, BH * .6 - 360)
    d = ImageDraw.Draw(b)
    d.rectangle([BW * .72, BH * .56, BW * .84, BH * .65], fill=(255, 196, 110, 255))
    # büyük ağaç gövdesi + gizemli figür
    fig = Image.new("RGBA", SZ, (0, 0, 0, 0))
    fd = ImageDraw.Draw(fig)
    fx, fb = BW * .36, BH * .90
    fd.polygon([(fx - 150, fb), (fx + 150, fb), (fx + 60, fb - 760), (fx - 60, fb - 760)], fill=(4, 2, 8, 255))  # palto
    fd.ellipse([fx - 80, fb - 900, fx + 80, fb - 720], fill=(4, 2, 8, 255))  # baş
    fd.ellipse([fx - 190, fb - 860, fx + 190, fb - 800], fill=(4, 2, 8, 255))  # şapka kenarı
    fd.polygon([(fx - 90, fb - 840), (fx + 90, fb - 840), (fx + 60, fb - 1000), (fx - 60, fb - 1000)], fill=(4, 2, 8, 255))
    rim = Image.new("RGBA", SZ, (255, 80, 110, 0))
    rim.putalpha(fig.getchannel("A").filter(ImageFilter.GaussianBlur(22)).point(lambda v: min(255, int(v * 1.6))))
    paste(b, glow(260, (150, 30, 60), 120), fx - 780, fb - 600 - 780)
    b.alpha_composite(rim)
    b.alpha_composite(fig.filter(ImageFilter.GaussianBlur(2)))
    b.alpha_composite(blob_layer(SZ, [("p", [(fx - 520, fb + 40), (fx - 300, fb + 40), (fx - 330, 0), (fx - 470, 0)], (8, 4, 12, 255))]
                                 + tree(fx - 400, fb, 1500, (14, 4, 14, 255), random.Random(18))[1:], 4))
    b.alpha_composite(bushes(SZ, int(BH * .84), (14, 4, 12, 255), 19))
    return b


def bg_end():
    b = to_img(gradient(BW, BH, [(0, (16, 18, 60)), (.6, (60, 40, 100)), (1, (24, 16, 40))]))
    stars(b, 200, .7, 20)
    b.alpha_composite(forest(SZ, int(BH * .86), 12, 500, 800, (30, 26, 70, 255), 21, 6))
    return b


print("arka planlar çiziliyor...")
BGS = [bg_dusk(), bg_bushes(), bg_night_path(), bg_cottage(), bg_shadow(), bg_end()]
GIRL = scaled(Image.open("assets/ep01/kiz.png").convert("RGBA"), 700)
WOLF = Image.open("assets/ep01/kurt.png").convert("RGBA")
WOLF_NIGHT = tint(scaled(WOLF, 760), (.78, .82, 1.0))
WOLF_DOOR = tint(scaled(WOLF, 600), (.8, .78, .9), (12, 6, 0))
WOLF_END = scaled(WOLF, 640).transpose(Image.FLIP_LEFT_RIGHT)
GIRL_END = scaled(Image.open("assets/ep01/kiz.png").convert("RGBA"), 620)
EYE = glow(22, (255, 180, 60), 230)
ImageDraw.Draw(EYE).ellipse([66 - 16, 66 - 9, 66 + 16, 66 + 9], fill=(255, 245, 190, 255))
FIREFLY = glow(6, (255, 236, 140), 200)
LANTERN = glow(90, (255, 190, 90), 120)
MIST = glow(180, (200, 210, 255), 40)
FLIES = [(random.uniform(0, W), random.uniform(H * .3, H * .9), random.uniform(.3, 1.1), random.uniform(0, 6.3))
         for _ in range(30)]


def camera(bg, t0, t1, t, z0, z1, px=0.0, py=0.0):
    """Arka plandan yakınlaşan/kayan bir W x H kare kes."""
    u = smooth((t - t0) / (t1 - t0))
    z = z0 + (z1 - z0) * u  # 1.0 = tam görüntü (BW), CAM = en yakın
    cw, ch = BW / z, BH / z
    cx = BW / 2 + px * u * (BW - cw) / 2
    cy = BH / 2 + py * u * (BH - ch) / 2
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return bg.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)


def fireflies(f, t, strength=1.0):
    for x, y, sp, ph in FLIES:
        fx = (x + math.sin(t * sp + ph) * 70 + t * 10) % W
        fy = y + math.cos(t * sp * 1.3 + ph) * 50
        paste(f, FIREFLY, fx - 18, fy - 18, strength * (.3 + .7 * abs(math.sin(t * 2 + ph))))


def scene(i, t):
    t0, t1 = SCENES[i]
    lt = t - t0
    if i == 0:  # alacakaranlıkta yürüyen kız
        f = camera(BGS[0], t0, t1 + XF, t, 1.0, 1.08, 0, .3)
        gx = W * .5 - GIRL.width / 2 + (1 - smooth(lt / 3.0)) * -260
        bob = abs(math.sin(lt * 5.5)) * 12
        paste(f, ground_shadow(GIRL.width), gx, H * .86 - 40)
        paste(f, GIRL, gx, H * .86 - 660 - bob)
        fireflies(f, t, .7)
    elif i == 1:  # çalılıkta parlayan gözler
        f = camera(BGS[1], t0, t1 + XF, t, 1.02, 1.12, 0, .5)
        for k, (ex, ey, ph) in enumerate([(W * .5, H * .66, 0), (W * .22, H * .72, 1.3), (W * .78, H * .7, 2.1)]):
            a = smooth((lt - .3 - k * .5) / .5)
            blink = 0 if ((lt + ph) % 2.0) < .12 else 1
            paste(f, EYE, ex - 75 - 66, ey - 66, a * blink)
            paste(f, EYE, ex + 75 - 66, ey - 66, a * blink)
        paste(f, MIST, (lt * 40) % W - 540, H * .78 - 540, 1)
        paste(f, MIST, W - (lt * 30) % W - 540, H * .86 - 540, 1)
    elif i == 2:  # fenerli kurt yürüyor; sonda şişeye yakınlaş
        f = camera(BGS[2], t0, t1 + XF, t, 1.0, 1.06, 0, .2)
        walk = smooth(lt / 2.6)
        wx = W + 40 - walk * (W * .5 + WOLF_NIGHT.width / 2 + 40)
        bob = abs(math.sin(lt * 5)) * 10 * (1 - smooth((lt - 2.4) / .4))
        wy = H * .93 - WOLF_NIGHT.height - bob
        pulse = .85 + .15 * math.sin(t * 7)
        lx, ly = wx + WOLF_NIGHT.width * .44, wy + WOLF_NIGHT.height * .58
        paste(f, ground_shadow(WOLF_NIGHT.width), wx, H * .93 - 40)
        paste(f, LANTERN, lx - 270, ly - 270, pulse)
        paste(f, WOLF_NIGHT, wx, wy)
        fireflies(f, t, .8)
        if lt > 2.6:  # şişeye yakınlaşma
            z = 1 + .55 * smooth((lt - 2.6) / 1.2)
            bx, by = wx + WOLF_NIGHT.width * .62, wy + WOLF_NIGHT.height * .53
            cw, ch = W / z, H / z
            x0 = min(max(bx - cw / 2, 0), W - cw)
            y0 = min(max(by - ch / 2, 0), H - ch)
            f = f.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BILINEAR)
            sp = smooth((lt - 3.0) / .5)
            sx, sy = (bx - x0) * z, (by - y0) * z
            paste(f, glow(40, (120, 255, 140), 160), sx - 120, sy - 120, sp * (.6 + .4 * math.sin(t * 8)))
    elif i == 3:  # kulübe kapısında kurt
        f = camera(BGS[3], t0, t1 + XF, t, 1.0, 1.1, 0, .4)
        wx, wy = W * .52, H * .93 - WOLF_DOOR.height
        paste(f, LANTERN, wx + WOLF_DOOR.width * .44 - 270, wy + WOLF_DOOR.height * .58 - 270, .9)
        paste(f, WOLF_DOOR.transpose(Image.FLIP_LEFT_RIGHT), wx, wy)
        for k in range(6):  # sıcak ışık kıvılcımları
            a = ang = t * 1.2 + k
            paste(f, FIREFLY, W * .3 + math.cos(ang) * 120 - 18, H * .55 + math.sin(ang) * 80 - 18, .8)
    elif i == 4:  # gizemli gölge
        f = camera(BGS[4], t0, t1 + XF, t, 1.0, 1.12, -.3, .3)
        pulse = .5 + .5 * math.sin(t * 7)
        f.alpha_composite(Image.new("RGBA", (W, H), (120, 0, 20, int(50 * pulse))))
        paste(f, MIST, (lt * 50) % W - 540, H * .85 - 540, 1)
    else:  # kapanış kartı
        f = camera(BGS[5], t0, t1, t, 1.0, 1.05)
        a = smooth(lt / .5)
        paste(f, GIRL_END, W * .06, H * .93 - GIRL_END.height, a)
        paste(f, WOLF_END, W * .40, H * .93 - WOLF_END.height, a)
        fireflies(f, t, 1)
    return f


# ---------------------------------------------------------------- altyazılar
FONT = ImageFont.truetype(FONT_BOLD, 84)
SYL = "aeıioöuüAEIİOÖUÜ"


def syllables(w):
    return max(1, sum(ch in SYL for ch in w))


def wrap(words, maxw, d):
    lines, cur = [], []
    for w in words:
        test = " ".join(cur + [w])
        if cur and d.textlength(test, font=FONT) > maxw:
            lines.append(cur)
            cur = [w]
        else:
            cur.append(w)
    return lines + [cur]


def caption(f, t):
    for s, e, text in PHRASES:
        if not (s - .1 <= t <= e + .45):
            continue
        a = smooth((t - s + .1) / .2) * (1 - smooth((t - e - .2) / .25))
        words = text.split()
        weights = np.cumsum([0] + [syllables(w) for w in words])
        times = s + (e - s) * weights / weights[-1]
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        lines = wrap(words, W - 140, d)
        y = H * .25 - len(lines) * 55
        k = 0
        for line in lines:
            lw = d.textlength(" ".join(line), font=FONT)
            x = (W - lw) / 2
            for w in line:
                start = times[k]
                active = start <= t < times[k + 1]
                shown = t >= start - .05
                col = (255, 214, 90) if active else (255, 255, 255)
                if shown:
                    d.text((x, y), w, font=FONT, fill=col + (255,), stroke_width=9, stroke_fill=(20, 10, 30, 255))
                x += d.textlength(w + " ", font=FONT)
                k += 1
            y += 112
        paste(f, layer, 0, 0, a)


BRAND = ms.text_layer("✦ Başka Bir Masalda ✦", (255, 214, 120), 52)
FOLLOW = ms.text_layer("TAKİP ET", (255, 214, 90), 130)
NEXT = ms.text_layer("Bölüm 2 yakında...", (255, 255, 255), 64)


def render(i):
    t = i / FPS
    cur = next(k for k, (s, e) in enumerate(SCENES) if s <= t < e or k == len(SCENES) - 1)
    f = scene(cur, t)
    s, _ = SCENES[cur]
    if cur > 0 and t < s + XF:  # önceki sahneden çapraz geçiş
        prev = scene(cur - 1, t)
        f = Image.blend(prev, f, smooth((t - s) / XF))
    f.alpha_composite(ms.VIGNETTE)
    if t >= 18.3:  # anlatım bittikten sonra büyük "TAKİP ET"
        a = smooth((t - 18.3) / .3)
        sc = .8 + .2 * smooth((t - 18.3) / .3) + .03 * math.sin(t * 8)
        im = FOLLOW.resize((int(FOLLOW.width * sc), int(FOLLOW.height * sc)), Image.LANCZOS)
        paste(f, im, (W - im.width) / 2, H * .25 - im.height / 2, a)
        paste(f, NEXT, 0, H * .25 + 110, a)
    else:
        caption(f, t)
    paste(f, BRAND, 0, 140, .9)
    if t < .25:
        f.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * (1 - t / .25)))))
    return f.convert("RGB")


def main():
    ms.music(melody=None, whooshes=[s for s, _ in SCENES[1:]], tense=(12.4, 16.1), drone=(3.3, 16.1),
             out_path="music_ep01.wav")
    proc = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-i", "music_ep01.wav", "-i", VOICE,
         "-filter_complex",
         f"[2:a]adelay={int(VOICE_DELAY * 1000)}|{int(VOICE_DELAY * 1000)},volume=1.6[v];"
         "[1:a]volume=0.28[m];[m][v]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]",
         "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-t", str(DUR), "-movflags", "+faststart", OUT],
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
