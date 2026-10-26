"""Uzun videodan 3 dikey Shorts keser (aynı ses ve görseller, ek üretim yok), 2. bölümden itibaren.

Kullanım: BOLUM=2 python3 make_shorts.py  ->  baska_bir_masalda_bNN_short_{1,2,3}.mp4
"""
import subprocess

from PIL import Image, ImageDraw, ImageFont

import make_uzun as L

W, H, FPS = 1080, 1920, 30
FONT = L.FONT
END = 2.5  # "Tamamı kanalda" kartı

# (ad, parça no, satır aralığı [a, b), üst başlık)
SHORTS = {
    2: [
        ("1", 2, (3, 5), "Külkedisi'nin ayakkabısı\ngerçekten cam mıydı?"),
        ("2", 3, (4, 6), "Grimm'in Külkedisi'nde\nayakkabı altındandı"),
        ("3", 4, (0, 2), "Külkedisi'nin bin yıllık\nÇinli hâli"),
    ],
    3: [
        ("1", 1, (0, 2), "Kötü kraliçe\naslında kimdi?"),
        ("2", 3, (6, 7), "Pamuk Prenses'i\nöpücük uyandırmadı"),
        ("3", 4, (1, 2), "Gerçek bir \"sihirli ayna\"\nvar mı?"),
    ],
    4: [
        ("1", 1, (0, 2), "Alaaddin'i aslında\nkim anlattı?"),
        ("2", 3, (3, 5), "Alaaddin'de üç dilek\nhakkı yoktu!"),
        ("3", 3, (1, 3), "Alaaddin'in masalında\naslında iki cin var"),
    ],
}[L.BOLUM]


def line_times(part):
    """Parçadaki her satırın (başlangıç, bitiş) süresi, parça içi saniye."""
    lines = L.part_lines()[part - 1]
    d = L.duration(f"{L.SES}/p{part}.mp3")
    total = sum(len(x) for x, _ in lines)
    out, t = [], 0.0
    for x, sc in lines:
        ld = d * len(x) / total
        out.append((t, t + ld, x, sc))
        t += ld
    return out


SUBF = ImageFont.truetype(FONT, 66)
TOPF = ImageFont.truetype(FONT, 64)
ENDF = ImageFont.truetype(FONT, 96)


def text_block(text, font, maxw, fill, stroke=7):
    tmp = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    lines = []
    for para in text.split("\n"):
        cur = ""
        for w in para.split():
            test = (cur + " " + w).strip()
            if tmp.textlength(test, font=font) > maxw and cur:
                lines.append(cur)
                cur = w
            else:
                cur = test
        lines.append(cur)
    lh = int(font.size * 1.25)
    img = Image.new("RGBA", (W, lh * len(lines) + 30), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, line in enumerate(lines):
        tw = d.textlength(line, font=font)
        d.text(((W - tw) / 2, 15 + i * lh), line, font=font, fill=fill, stroke_width=stroke, stroke_fill=(10, 5, 15))
    return img


# Shorts için ayrı yazılmış kısa metinler (3. bölümden itibaren): ilk cümle soru şeklinde kanca, son cümle
# başa bağlanır. Ses: assets/bNN/ses/short_N.mp3. Biçim: ad -> (üst başlık, [(sahne, alt yazı metni), ...])
METIN = {
    3: {
        "1": ("Kötü kraliçe\naslında kimdi?", [
            (2, "Pamuk Prenses'in kötü kraliçesi aslında kimdi? İlk baskıdaki cevap çok şaşırtıcı."),
            (6, "1812'de Grimm Kardeşler'in yazdığı masalda kraliçe, üvey anne değil, Pamuk Prenses'in öz annesiydi."),
            (7, "Yedi yıl sonra bu fazla ağır bulundu ve masala üvey anne eklendi. Peki o zaman, kötü kraliçe "
                "aslında kimdi?")]),
        "2": ("Pamuk Prenses'i\nöpücük uyandırmadı", [
            (11, "Pamuk Prenses'i bir öpücük uyandırmadı. Peki ne uyandırdı?"),
            (12, "Grimm'in masalında prensin uşakları cam tabutu taşırken biri bir ağaç köküne takılıp tökezliyor. "
                 "Sarsıntıyla elma parçası boğazından çıkıyor ve Pamuk Prenses gözlerini açıyor. Yani onu kurtaran "
                 "bir öpücük değil, sakar bir uşaktı.")]),
        "3": ("Gerçek bir \"sihirli ayna\"\nvar mı?", [
            (14, "Gerçek bir sihirli ayna var mı? Almanya'da bir kasaba, var diyor."),
            (13, "Lohr kasabasındaki şatoda, üzerinde Fransızca \"kendini sevme\" yazan yüzlerce yıllık bir ayna duruyor."),
            (14, "Bazı araştırmacılara göre Pamuk Prenses'in aynası buydu. Bu bir teori, ama kasaba kendine artık "
                 "Pamuk Prenses Şehri diyor. Sence gerçek bir sihirli ayna var mı?")]),
    },
    4: {
        "1": ("Alaaddin'i aslında\nkim anlattı?", [
            (5, "Alaaddin'i aslında kim anlattı? Cevap: Halepli, yirmi yaşında bir genç."),
            (2, "1709'da Hanna Diyab, Paris'te Fransız yazar Galland'a masallar anlattı. Alaaddin de bunlardan biriydi."),
            (7, "Ama kitap basıldığında Hanna'nın adı yoktu. Masalın gerçek anlatıcısı neredeyse üç yüz yıl unutuldu. "
                "Peki Alaaddin'i aslında kim anlattı?")]),
        "2": ("Alaaddin'de üç dilek\nhakkı yoktu!", [
            (11, "Alaaddin'in cini üç dilek hakkı veriyor, değil mi? Aslında hayır. Orijinal masalda böyle bir kural "
                 "yok. Lamba kimin elindeyse cin onun her isteğini yerine getiriyor."),
            (12, "Bir gecede saray bile yapıyor. Üç dilek fikri, sonraki uyarlamalarla geldi. Sen olsan, üç dilekle "
                 "yetinir miydin?")]),
        "3": ("Alaaddin'in masalında\naslında iki cin var", [
            (10, "Alaaddin'in masalında bir değil, iki cin var. Biliyor muydun? İlki yüzükteki küçük cin. Alaaddin "
                 "mağarada mahsur kalınca onu kurtaran, bu cin."),
            (11, "İkincisi lambanın dev cini. Herkes onu hatırlıyor, ama asıl kahraman belki de unutulan küçük cindi. "
                 "Sen hangisini seçerdin?")]),
    },
}.get(L.BOLUM)


# Her sahnede dikey kadrajın ortalanacağı yatay nokta (0 = sol, 1 = sağ)
FOCUS = {
    2: {6: 0.47, 7: 0.3, 12: 0.45, 13: 0.55, 15: 0.5},
    3: {1: 0.5, 2: 0.62, 12: 0.42, 14: 0.5},
    4: {2: 0.38, 5: 0.33, 6: 0.45, 9: 0.4, 10: 0.42, 11: 0.5},
}[L.BOLUM]


def vertical(sc, k, u):
    im = L.IMGS[sc]
    iw, ih = im.size
    cw = ih * 9 / 16
    span = iw - cw
    fx = FOCUS.get(sc, 0.5) + 0.06 * ((u if k % 2 == 0 else 1 - u) - 0.5)
    x0 = min(max(fx * iw - cw / 2, 0), span)
    z = 1.0 + 0.06 * u
    ch2, cw2 = ih / z, cw / z
    box = (x0 + (cw - cw2) / 2, (ih - ch2) / 2, x0 + (cw + cw2) / 2, (ih + ch2) / 2)
    return im.resize((W, H), Image.BILINEAR, box=box)


def make(name, part, rng, top):
    lt = line_times(part)
    a, b = lt[rng[0]][0], lt[rng[1] - 1][1]
    render(name, [(s - a, e - a, text, sc) for s, e, text, sc in lt[rng[0]:rng[1]]], b - a, top,
           f"{L.SES}/p{part}.mp3", a)


def make_metin(name, top, parts):
    """Ayrı seslendirilmiş kısa Shorts metni: sahne süreleri metin uzunluğuna göre dağıtılır."""
    ses = f"{L.SES}/short_{name}.mp3"
    d = L.duration(ses)
    total = sum(len(x) for _, x in parts)
    lines, t = [], 0.0
    for sc, x in parts:
        ld = d * len(x) / total
        lines.append((t, t + ld, x, sc))
        t += ld
    render(name, lines, d, top, ses, 0.0)


def render(name, lines, speech, top, ses, a):
    """lines: [(başlangıç, bitiş, metin, sahne)] short içi zaman; ses dosyası a saniyesinden itibaren speech kadar."""
    b = a + speech
    segs = []  # (başlangıç, bitiş, sahne) short içi zaman
    subs = []
    for s, e, text, sc in lines:
        if segs and segs[-1][2] == sc:
            segs[-1][1] = e
        else:
            segs.append([s, e, sc])
        sents = [x.strip() for x in L.re.split(r'(?<=[.!?…])\s+|(?<=[.!?…]")\s+', text) if x.strip()]
        tot = sum(len(x) for x in sents)
        c = s
        for x in sents:
            d = (e - s) * len(x) / tot
            subs.append((c, c + d, x))
            c += d
    dur = (b - a) + END
    segs[-1][1] = dur
    topimg = text_block(top, TOPF, W - 120, (255, 214, 110))
    endimg = text_block("Tamamı kanalda ▶", ENDF, W - 100, (255, 255, 255), 9)
    subimgs = {}
    out = f"baska_bir_masalda_{L.B}_short_{name}.mp4"
    proc = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", ses,
         "-i", f"{L.B}_muzik.wav",
         "-filter_complex",
         f"[1:a]apad=whole_dur={dur}[v];[2:a]atrim=0:{dur},volume=0.25[m];"
         "[v][m]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]",
         "-map", "0:v", "-map", "[aout]", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-t", f"{dur:.3f}",
         "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    for i in range(int(dur * FPS)):
        t = i / FPS
        k = next(j for j, (s, e, _) in enumerate(segs) if s <= t < e or j == len(segs) - 1)
        s, e, sc = segs[k]
        f = vertical(sc, k, (t - s) / max(e - s, 0.1)).convert("RGBA")
        if k > 0 and t < s + 0.5:
            ps, pe, psc = segs[k - 1]
            prev = vertical(psc, k - 1, 1.0).convert("RGBA")
            f = Image.blend(prev, f, L.smooth((t - s) / 0.5))
        f.alpha_composite(L.Image.new("RGBA", (W, 480), (0, 0, 0, 110)), (0, 0))
        f.alpha_composite(topimg, (0, 170))
        if t < b - a:
            for sa, sb, text in subs:
                if sa <= t < sb:
                    if text not in subimgs:
                        subimgs[text] = text_block(text, SUBF, W - 140, (255, 250, 235))
                    im = subimgs[text]
                    f.alpha_composite(im, (0, int(H * 0.66)))
                    break
        else:
            al = L.smooth((t - (b - a)) / 0.3)
            f.alpha_composite(L.Image.new("RGBA", (W, H), (0, 0, 0, int(150 * al))))
            e2 = endimg.copy()
            e2.putalpha(e2.getchannel("A").point(lambda v: int(v * al)))
            f.alpha_composite(e2, (0, H // 2 - e2.height // 2))
        f.alpha_composite(L.BRAND, (40, 60))
        proc.stdin.write(f.convert("RGB").tobytes())
    proc.stdin.close()
    proc.wait()
    print("Bitti:", out, f"{dur:.1f} sn")


if __name__ == "__main__":
    for s in SHORTS:
        if METIN and s[0] in METIN:
            make_metin(s[0], *METIN[s[0]])
        else:
            make(*s)
