"""Shorts kapak görseli (1080x1920). Kullanım: python3 make_cover.py"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import make_short as ms

W, H = ms.W, ms.H


def outlined(d, xy, text, font, fill, stroke=10):
    d.text(xy, text, font=font, fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0))


def centered(d, y, text, font, fill, stroke=10):
    tw = d.textlength(text, font=font)
    outlined(d, ((W - tw) / 2, y), text, font, fill, stroke)


f = ms.SKY.copy()
d = ImageDraw.Draw(f)
for x, y, r, _, _ in ms.STARS:
    d.ellipse([x - r, y - r, x + r, y + r], fill=(230, 230, 255))
ms.paste(f, ms.MOON.resize((900, 900)), 180, 380)
ms.paste(f, ms.FAR, -100, 0)
ms.paste(f, ms.MID, -200, 0)
ms.paste(f, ms.NEAR, -300, 0)

# Kurt (sağda, fenerli) ve kız (solda)
wolf = ms.make_wolf().resize((900, 727), Image.LANCZOS)
wolf_x, wolf_y = 400, int(H * 0.93) - 727
ms.paste(f, ms.LANTERN.resize((300, 300)), wolf_x + 70 - 150, wolf_y + 460 - 150)
rim = Image.new("RGBA", wolf.size, (170, 140, 255, 0))
rim.putalpha(wolf.getchannel("A").filter(ImageFilter.GaussianBlur(14)))
ms.paste(f, rim, wolf_x, wolf_y, 0.8)
ms.paste(f, wolf, wolf_x, wolf_y)
girl = ms.GIRL.resize((390, 598), Image.LANCZOS)
ms.paste(f, girl, 0, int(H * 0.95) - 598)

for x, y, _, _ in ms.FIREFLIES:
    ms.paste(f, ms.GLOW, x - 18, y - 18, 0.9)
f.alpha_composite(ms.VIGNETTE)

# Başlık arkası koyu şerit
band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(band).rectangle([0, 230, W, 860], fill=(0, 0, 0, 120))
f.alpha_composite(band.filter(ImageFilter.GaussianBlur(40)))

d = ImageDraw.Draw(f)
brand = ImageFont.truetype(ms.FONT_BOLD, 60)
big = ImageFont.truetype(ms.FONT_BOLD, 175)
mid = ImageFont.truetype(ms.FONT_BOLD, 96)
centered(d, 120, "✦ Başka Bir Masalda ✦", brand, (255, 214, 120), 6)
centered(d, 290, "KURT", big, (255, 255, 255), 14)
centered(d, 480, "KÖTÜ", big, (255, 70, 70), 14)
centered(d, 670, "DEĞİLDİ?!", big, (255, 214, 120), 14)
centered(d, 900, "Kırmızı Başlıklı Kız", mid, (255, 255, 255), 9)

f.convert("RGB").save("baska_bir_masalda_kapak_01.jpg", quality=92)
print("Bitti: baska_bir_masalda_kapak_01.jpg")
