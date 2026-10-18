"""'Başka Bir Masalda' Shorts #02 – Pamuk Prenses.

Kullanım: python3 make_short_02.py  ->  baska_bir_masalda_short_02.mp4
"""
import math

from PIL import Image, ImageDraw, ImageFilter

import make_short as ms
from make_short import DUR, FPS, H, W, paste, smooth

OUT = "baska_bir_masalda_short_02.mp4"

CAPTIONS = [
    (0.2, 3.6, "Pamuk Prenses'i\nherkes bilir...", (255, 255, 255)),
    (3.8, 7.2, "Ama başka\nbir masalda...", (255, 214, 120)),
    (7.4, 11.2, "Kraliçe elmayı\nzehirlemedi.", (255, 255, 255)),
    (11.4, 15.2, "Pamuk'u zehirden\nkurtarmaya çalıştı.", (150, 255, 190)),
    (15.4, 18.2, "Peki elmayı\nkim zehirledi?", (140, 255, 90)),
    (18.3, 20.0, "Devamı için\nTAKİP ET", (255, 214, 120)),
]
CAP_IMGS = [ms.text_layer(t, c, 92) for _, _, t, c in CAPTIONS]


def make_princess():
    img = Image.new("RGBA", (300, 470), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(150, 190), (50, 430), (250, 430)], fill=(250, 210, 60))  # sarı etek
    d.rectangle([110, 180, 190, 260], fill=(40, 70, 170))  # mavi gövde
    d.ellipse([85, 170, 125, 215], fill=(200, 30, 40))  # kırmızı omuzluk
    d.ellipse([175, 170, 215, 215], fill=(200, 30, 40))
    d.ellipse([95, 50, 205, 165], fill=(20, 15, 25))  # siyah saç
    d.ellipse([108, 75, 192, 170], fill=(252, 226, 210))  # yüz
    d.pieslice([100, 50, 200, 130], 180, 360, fill=(20, 15, 25))
    d.rectangle([110, 55, 190, 72], fill=(220, 30, 40))  # kırmızı kurdele
    d.ellipse([128, 112, 140, 124], fill=(40, 20, 20))
    d.ellipse([160, 112, 172, 124], fill=(40, 20, 20))
    d.arc([135, 128, 165, 150], 20, 160, fill=(200, 60, 70), width=3)
    d.rectangle([118, 430, 134, 462], fill=(60, 30, 20))
    d.rectangle([166, 430, 182, 462], fill=(60, 30, 20))
    return img


def make_queen():
    """Taçlı, pelerinli kraliçe silueti (iyi kalpli)."""
    img = Image.new("RGBA", (420, 700), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    col = (30, 18, 50)
    d.polygon([(210, 150), (20, 690), (400, 690)], fill=col)  # pelerin
    d.polygon([(110, 140), (60, 40), (210, 120), (360, 40), (310, 140)], fill=col)  # yaka
    d.ellipse([160, 70, 260, 180], fill=col)  # baş
    d.polygon([(165, 80), (170, 20), (190, 55), (210, 10), (230, 55), (250, 20), (255, 80)],
              fill=(255, 205, 80))  # taç
    for x in (170, 210, 250):
        d.ellipse([x - 6, 14, x + 6, 26], fill=(120, 230, 255))
    d.polygon([(210, 260), (330, 420), (300, 430), (200, 300)], fill=col)  # uzanan kol
    return img


def make_apple(r=120):
    img = Image.new("RGBA", (r * 3, r * 3), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = r * 1.5
    d.ellipse([c - r, c - r * 0.85, c, c + r * 0.95], fill=(210, 20, 35))
    d.ellipse([c, c - r * 0.85, c + r, c + r * 0.95], fill=(210, 20, 35))
    d.ellipse([c - r * 0.75, c - r * 0.95, c + r * 0.75, c + r * 0.9], fill=(225, 30, 45))
    d.ellipse([c - r * 0.6, c - r * 0.55, c - r * 0.25, c - r * 0.1], fill=(255, 140, 140))  # parlama
    d.line([(c, c - r * 0.75), (c + r * 0.12, c - r * 1.2)], fill=(90, 50, 20), width=int(r * 0.12))
    d.ellipse([c + r * 0.1, c - r * 1.25, c + r * 0.6, c - r * 0.95], fill=(70, 170, 60))  # yaprak
    return img


def make_aura(size, color):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(img).ellipse([size * 0.2, size * 0.2, size * 0.8, size * 0.8], fill=color + (200,))
    return img.filter(ImageFilter.GaussianBlur(size // 10))


def make_hooded():
    """Gizemli kapüşonlu figür (son sahne)."""
    img = Image.new("RGBA", (500, 900), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(250, 40), (40, 880), (460, 880)], fill=(5, 5, 8))
    d.ellipse([140, 30, 360, 300], fill=(5, 5, 8))
    d.ellipse([190, 150, 225, 175], fill=(140, 255, 90))
    d.ellipse([275, 150, 310, 175], fill=(140, 255, 90))
    return img


PRINCESS = make_princess()
QUEEN = make_queen()
QUEEN_RIM = Image.new("RGBA", QUEEN.size, (200, 170, 255, 0))
QUEEN_RIM.putalpha(QUEEN.getchannel("A").filter(ImageFilter.GaussianBlur(12)))
APPLE = make_apple()
AURA_GREEN = make_aura(600, (90, 255, 60))
AURA_GOLD = make_aura(600, (255, 220, 120))
HOODED = make_hooded()
SPARK_GREEN = ms.make_glow(5, (120, 255, 80))
SPARK_GOLD = ms.make_glow(5, (255, 220, 120))


def render(i):
    t = i / FPS
    f = ms.SKY.copy()
    d = ImageDraw.Draw(f)
    for x, y, r, ph, sp in ms.STARS:
        a = 0.5 + 0.5 * math.sin(ph + t * sp)
        c = int(120 + 135 * a)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(c, c, min(255, c + 20)))
    paste(f, ms.MOON, 560 - t * 4, -40 + t * 2)
    pan = t / DUR
    paste(f, ms.FAR, -pan * 300, 0)
    paste(f, ms.MID, -pan * 500, 0)
    paste(f, ms.NEAR, -pan * 800, 0)

    # Sahne 1-2: Pamuk Prenses yürüyor
    if t < 7.6:
        px = -320 + smooth(t / 6.5) * 640
        bob = abs(math.sin(t * 6)) * 14
        paste(f, PRINCESS, px, H * 0.90 - 460 - bob, 1 - smooth((t - 7.0) / 0.6))

    # Elma: sahne 3'te zehirli yeşil, sahne 4'te altın ışıkla temizleniyor
    ax, ay = W / 2 - APPLE.width / 2, H * 0.62 - APPLE.height / 2
    if 7.0 < t < 15.6:
        a = smooth((t - 7.2) / 0.7) * (1 - smooth((t - 15.0) / 0.6))
        float_y = math.sin(t * 2) * 15
        heal = smooth((t - 12.0) / 2.0)
        pulse = 0.75 + 0.25 * math.sin(t * 6)
        paste(f, AURA_GREEN, W / 2 - 300, ay + APPLE.height / 2 - 300 + float_y, a * pulse * (1 - heal))
        paste(f, AURA_GOLD, W / 2 - 300, ay + APPLE.height / 2 - 300 + float_y, a * heal)
        if t > 11.0:
            qa = smooth((t - 11.2) / 0.6) * (1 - smooth((t - 15.0) / 0.6))
            qx = -30 + smooth((t - 11.0) / 1.5) * 60
            paste(f, QUEEN_RIM, qx, H * 0.90 - 700, qa * 0.9)
            paste(f, QUEEN, qx, H * 0.90 - 700, qa)
        paste(f, APPLE, ax, ay + float_y, a)
        for k in range(14):
            ang = t * 1.5 + k * 2 * math.pi / 14
            rr = 170 + 30 * math.sin(t * 3 + k)
            sx = W / 2 + math.cos(ang) * rr - 15
            sy = H * 0.62 + math.sin(ang) * rr * 0.8 + float_y - 15
            paste(f, SPARK_GREEN, sx, sy, a * (1 - heal))
            paste(f, SPARK_GOLD, sx, sy, a * heal)

    for x, y, sp, ph in ms.FIREFLIES:
        fx = (x + math.sin(t * sp + ph) * 80 + t * 12) % W
        fy = y + math.cos(t * sp * 1.3 + ph) * 60
        paste(f, ms.GLOW, fx - 18, fy - 18, 0.4 + 0.6 * abs(math.sin(t * 2 + ph)))

    # Sahne 5: yeşil gerilim ve gizemli figür
    if 15.2 < t < 18.3:
        a = smooth((t - 15.2) / 0.5) * (1 - smooth((t - 17.9) / 0.4))
        pulse = 0.5 + 0.5 * math.sin(t * 9)
        f.alpha_composite(Image.new("RGBA", (W, H), (10, 70, 10, int(100 * a * (0.6 + 0.4 * pulse)))))
        paste(f, HOODED, W / 2 - 250, H - 900 + (1 - smooth((t - 15.2) / 1.2)) * 200, a)

    f.alpha_composite(ms.VIGNETTE)
    for (s, e, _, _), img in zip(CAPTIONS, CAP_IMGS):
        if s <= t <= e:
            a = smooth((t - s) / 0.35) * (1 - smooth((t - (e - 0.25)) / 0.25))
            sc = 0.85 + 0.15 * smooth((t - s) / 0.3)
            im = img.resize((int(img.width * sc), int(img.height * sc)), Image.LANCZOS)
            paste(f, im, (W - im.width) / 2, H * 0.40 - im.height / 2, a)
    paste(f, ms.BRAND, 0, 150, 0.9)
    if t < 0.4:
        f.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * (1 - t / 0.4)))))
    return f.convert("RGB")


# Re minör, biraz daha masalsı/gizemli bir melodi
MELODY = [74, 77, 81, 77, 74, 76, 77, 74, 72, 76, 79, 76, 73, 76, 81, 79,
          77, 74, 70, 74, 77, 81, 79, 77, 76, 73, 69, 73, 76, 79, 77, 76]

if __name__ == "__main__":
    ms.main(render, OUT, melody=MELODY)
