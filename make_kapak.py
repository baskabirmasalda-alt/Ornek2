"""YouTube kapağı (1280x720): kalın 3B yazı + kırmızı fırça etiketi, karakterler sağda.

Kullanım:
    python3 make_kapak.py arka_plan.png cikti.jpg "SATIR 1|beyaz" "SATIR 2|altin" "KELİME|beyaz;KELİME!|kirmizi" --etiket "Bilinmeyen Gerçek Hikâye"
Satır biçimi: "metin|renk", aynı satırda birden çok renk için parçaları ";" ile ayır.
Renkler: beyaz, altin, kirmizi.
"""
import argparse

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

W, H = 1280, 720
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
RENK = {  # dikey degrade: üst, alt
    "beyaz": ((255, 255, 255), (222, 222, 230)),
    "altin": ((255, 236, 90), (255, 140, 0)),
    "kirmizi": ((255, 70, 50), (190, 0, 10)),
}


def arka_plan(path, odak):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    cw = w / 1.08  # hafif yakınlaştır, odak noktası sağda kalsın
    ch = cw * 9 / 16
    x0 = min(max(odak * w - cw / 2, 0), w - cw)
    im = im.crop((int(x0), int((h - ch) / 2), int(x0 + cw), int((h + ch) / 2))).resize((W, H), Image.LANCZOS)
    im = ImageEnhance.Color(im).enhance(1.3)
    im = ImageEnhance.Contrast(im).enhance(1.12)
    c = im.convert("RGBA")
    yy, xx = np.mgrid[0:H, 0:W]
    a = np.clip(1 - xx / (W * 0.62), 0, 1) ** 1.5 * 170  # sola doğru koyulaş
    a += np.clip((yy - H * 0.75) / (H * 0.25), 0, 1) * 60
    ov = np.zeros((H, W, 4), np.uint8)
    ov[..., 3] = np.clip(a, 0, 255).astype(np.uint8)
    c.alpha_composite(Image.fromarray(ov, "RGBA"))
    return c


def degrade(size, ust, alt):
    w, h = size
    t = np.linspace(0, 1, h)[:, None, None]
    arr = (np.array(ust) * (1 - t) + np.array(alt) * t).astype(np.uint8)
    return Image.fromarray(np.repeat(arr, w, axis=1), "RGB")


def satir(parcalar, font, kontur):
    """Bir satırı (renkli parçalar) RGBA katman olarak çizer: degrade dolgu, kalın kontur, 3B gölge."""
    tmp = ImageDraw.Draw(Image.new("L", (1, 1)))
    genis = sum(tmp.textlength(m, font=font) for m, _ in parcalar)
    asc, desc = font.getmetrics()
    pad = kontur + 14
    lw, lh = int(genis + 2 * pad), asc + desc + 2 * pad
    lay = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
    x = pad
    for metin, renk in parcalar:
        mask = Image.new("L", (lw, lh), 0)
        ImageDraw.Draw(mask).text((x, pad), metin, font=font, fill=255)
        dis = Image.new("L", (lw, lh), 0)
        ImageDraw.Draw(dis).text((x, pad), metin, font=font, fill=255, stroke_width=kontur, stroke_fill=255)
        for d in range(max(6, kontur), 0, -1):  # 3B derinlik: koyu kopyalar sağ-aşağı
            sh = Image.new("RGBA", (lw, lh), (25, 8, 8, 255))
            lay.paste(sh, (d, d), dis)
        lay.paste(Image.new("RGBA", (lw, lh), (10, 5, 5, 255)), (0, 0), dis)
        g = degrade((lw, lh), *RENK[renk]).convert("RGBA")
        lay.paste(g, (0, 0), mask)
        x += tmp.textlength(metin, font=font)
    return lay


def etiket(metin, font):
    """Kırmızı fırça darbesi gibi pürüzlü etiket."""
    tmp = ImageDraw.Draw(Image.new("L", (1, 1)))
    tw = tmp.textlength(metin, font=font)
    bw, bh = int(tw + 90), int(font.size * 1.75)
    lay = Image.new("RGBA", (bw + 20, bh + 20), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    rng = np.random.default_rng(3)
    ust = [(10 + i * bw / 24, 10 + rng.uniform(0, 7)) for i in range(25)]
    alt = [(10 + i * bw / 24, 10 + bh - rng.uniform(0, 7)) for i in range(24, -1, -1)]
    sol = [(10 - rng.uniform(4, 14), 10 + bh * k / 6) for k in range(6, 0, -1)]
    sag = [(10 + bw + rng.uniform(4, 16), 10 + bh * k / 6) for k in range(1, 6)]
    poly = ust + sag + alt + sol
    d.polygon([(x + 5, y + 6) for x, y in poly], fill=(40, 0, 0, 200))
    d.polygon(poly, fill=(215, 20, 25, 255))
    d.text((10 + 45, 10 + (bh - font.size) / 2 - font.size * 0.12), metin, font=font, fill="white",
           stroke_width=2, stroke_fill=(120, 0, 0))
    return lay


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("arka")
    ap.add_argument("cikti")
    ap.add_argument("satirlar", nargs="+")
    ap.add_argument("--etiket", default="Bilinmeyen Gerçek Hikâye")
    ap.add_argument("--odak", type=float, default=0.55, help="arka planda yatay odak (0 sol, 1 sağ)")
    ap.add_argument("--aci", type=float, default=3.0, help="yazı bloğunun eğimi (derece)")
    a = ap.parse_args()

    c = arka_plan(a.arka, a.odak)
    satirlar = [[tuple(p.split("|")) for p in s.split(";")] for s in a.satirlar]
    # en uzun satır sol %60'a sığacak şekilde yazı boyutu
    boy = 150
    while boy > 60:
        f = ImageFont.truetype(FONT, boy)
        tmp = ImageDraw.Draw(Image.new("L", (1, 1)))
        if max(sum(tmp.textlength(m, font=f) for m, _ in s) for s in satirlar) < W * 0.64:
            break
        boy -= 4
    f = ImageFont.truetype(FONT, boy)
    katmanlar = [satir(s, f, max(9, boy // 9)) for s in satirlar]
    et = etiket(a.etiket, ImageFont.truetype(FONT, max(36, int(boy / 2.5))))
    blok_w = max([k.width for k in katmanlar] + [et.width])
    aralik = int(boy * 1.02)
    blok_h = aralik * len(katmanlar) + et.height + 30
    blok = Image.new("RGBA", (blok_w + 40, blok_h + 60), (0, 0, 0, 0))
    y = 0
    for k in katmanlar:
        blok.alpha_composite(k, (0, y))
        y += aralik
    blok.alpha_composite(et, (10, y + 18))
    blok = blok.rotate(a.aci, resample=Image.BICUBIC, expand=True)
    gol = blok.split()[3].filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * 0.55))
    c.paste((0, 0, 0), (14, (H - blok.height) // 2 + 14), gol)
    c.alpha_composite(blok, (14, max(0, (H - blok.height) // 2)))
    c.convert("RGB").save(a.cikti, quality=93)
    print("Bitti:", a.cikti)


if __name__ == "__main__":
    main()
