"""Kanal banner'ı (2560x1440) ve logosu (800x800).

Kullanım: python3 make_marka.py banner_arka.jpg logo_arka.jpg
Çıktı: assets/marka/banner.jpg, assets/marka/logo.png, assets/marka/filigran.png
Banner'da yazılar YouTube'un her cihazda gösterdiği orta güvenli alana (1546x423) yerleşir.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFont

import make_kapak as K

BW, BH = 2560, 1440
SAFE_W, SAFE_H = 1546, 423
OUT = "assets/marka"


def banner(src):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    ch = w * BH / BW  # 16:9 → 16:9, sadece ölçekle
    im = im.crop((0, int((h - ch) / 2), w, int((h + ch) / 2))).resize((BW, BH), Image.LANCZOS)
    im = ImageEnhance.Color(im).enhance(1.2)
    c = im.convert("RGBA")
    # orta güvenli alanın arkasına yumuşak koyu hare: yazı her zeminde okunsun
    yy, xx = np.mgrid[0:BH, 0:BW]
    r = np.sqrt(((xx - BW / 2) / (SAFE_W * 0.62)) ** 2 + ((yy - BH / 2) / (SAFE_H * 0.85)) ** 2)
    a = np.clip(1 - r, 0, 1) ** 1.2 * 150
    ov = np.zeros((BH, BW, 4), np.uint8)
    ov[..., 3] = a.astype(np.uint8)
    c.alpha_composite(Image.fromarray(ov, "RGBA"))

    f = ImageFont.truetype(K.FONT, 150)
    ust = K.satir([("BAŞKA BİR ", "beyaz"), ("MASALDA", "altin")], f, 16)
    alt_f = ImageFont.truetype(K.FONT, 54)
    alt = Image.new("RGBA", (SAFE_W, 90), (0, 0, 0, 0))
    d = ImageDraw.Draw(alt)
    t = "Bildiğin masalların hiç duymadığın yüzü"
    d.text(((SAFE_W - d.textlength(t, font=alt_f)) / 2, 10), t, font=alt_f, fill=(255, 240, 210),
           stroke_width=5, stroke_fill=(20, 10, 10))
    et = K.etiket("Her hafta yeni masal · 20:30", ImageFont.truetype(K.FONT, 44))

    blok_h = ust.height + alt.height + et.height
    y = (BH - blok_h) // 2 + 10
    c.alpha_composite(ust, ((BW - ust.width) // 2, y))
    y += ust.height - 10
    c.alpha_composite(alt, ((BW - SAFE_W) // 2, y))
    y += alt.height
    c.alpha_composite(et, ((BW - et.width) // 2, y))
    os.makedirs(OUT, exist_ok=True)
    c.convert("RGB").save(f"{OUT}/banner.jpg", quality=92)
    # güvenli alanı gösteren kontrol kopyası
    k = c.copy()
    ImageDraw.Draw(k).rectangle(((BW - SAFE_W) // 2, (BH - SAFE_H) // 2, (BW + SAFE_W) // 2, (BH + SAFE_H) // 2),
                                outline=(0, 255, 0, 255), width=6)
    k.convert("RGB").resize((1280, 720)).save(f"{OUT}/banner_kontrol.jpg", quality=85)


def logo(src):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    s = int(min(w, h) * 0.84)  # madalyonun altın çerçevesi daireye tam otursun
    im = im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2)).resize((800, 800), Image.LANCZOS)
    im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.15)).enhance(1.08)
    os.makedirs(OUT, exist_ok=True)
    im.save(f"{OUT}/logo.png")
    # filigran: daire maskeli 150x150
    m = Image.new("L", (800, 800), 0)
    ImageDraw.Draw(m).ellipse((0, 0, 799, 799), fill=255)
    fl = im.convert("RGBA")
    fl.putalpha(m)
    fl.resize((150, 150), Image.LANCZOS).save(f"{OUT}/filigran.png")
    # daire içinde nasıl görüneceği (önizleme)
    on = Image.new("RGB", (800, 800), (255, 255, 255))
    on.paste(im, (0, 0), m)
    on.resize((160, 160), Image.LANCZOS).save(f"{OUT}/logo_onizleme_kucuk.png")


if __name__ == "__main__":
    banner(sys.argv[1])
    logo(sys.argv[2])
    print("Bitti:", OUT)
