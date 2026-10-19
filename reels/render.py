import subprocess, sys, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

IMG = '/tmp/claude-0/-home-user-Ornek2/3c76ccc7-d6ee-55cc-9f96-8027216a8311/images/'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'reels_silent.mp4'
PREVIEW = len(sys.argv) > 2  # write still frames instead of video
W, H, FPS = 1080, 1920, 30
GREEN = (47, 59, 36)
CREAM = (247, 242, 233)
GOLD = (196, 170, 120)
F = '/usr/share/fonts/opentype/inter/'
def font(name, size): return ImageFont.truetype(F + name, size)

def load(f, box):
    im = Image.open(IMG + f).convert('RGB').crop(box)
    return im

src = {
    'hook': load('11.png', (245, 43, 514, 532)),   # face only, no step text
    'duo': load('8.png', (51, 37, 542, 526)),
    'serum': load('10.png', (85, 57, 576, 548)),
    'device': load('9.png', (40, 42, 531, 531)),
    'ritual': load('11.png', (245, 43, 514, 532)),
}
logo = Image.open(IMG + '12.webp').convert('RGBA')
# circular mask for logo
lm = Image.new('L', logo.size, 0); ImageDraw.Draw(lm).ellipse((0, 0, logo.size[0]-1, logo.size[1]-1), fill=255)
logo.putalpha(lm)

def bg_from(im):
    b = im.resize((W, int(W * im.height / im.width))).resize((W, H))
    b = b.filter(ImageFilter.GaussianBlur(40))
    return Image.blend(b, Image.new('RGB', (W, H), CREAM), 0.55)

BG = {k: bg_from(v) for k, v in src.items()}

def card(im, max_w, max_h, zoom):
    s = min(max_w / im.width, max_h / im.height)
    cw, ch = int(im.width * s), int(im.height * s)
    big = im.resize((int(cw * zoom), int(ch * zoom)), Image.LANCZOS)
    ox, oy = (big.width - cw) // 2, (big.height - ch) // 2
    c = big.crop((ox, oy, ox + cw, oy + ch)).filter(ImageFilter.UnsharpMask(2, 60, 2))
    m = Image.new('L', (cw, ch), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, cw - 1, ch - 1), 40, fill=255)
    return c, m

def paste_card(fr, im, cx, cy, max_w, max_h, zoom):
    c, m = card(im, max_w, max_h, zoom)
    x, y = cx - c.width // 2, cy - c.height // 2
    sh = Image.new('L', (W, H), 0); ImageDraw.Draw(sh).rounded_rectangle((x + 10, y + 24, x + c.width + 10, y + c.height + 24), 40, fill=90)
    sh = sh.filter(ImageFilter.GaussianBlur(28))
    fr.paste(Image.new('RGB', (W, H), (60, 50, 40)), (0, 0), sh)
    fr.paste(c, (x, y), m)
    return y, y + c.height

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines

def headline(fr, text, y, alpha, size=78, sub=None):
    d0 = ImageDraw.Draw(fr)
    f = font('Inter-ExtraBold.otf', size)
    lines = wrap(d0, text, f, 880)
    lh = int(size * 1.18)
    fs = font('Inter-SemiBold.otf', 44)
    th = lh * len(lines) + (70 if sub else 0)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    bw = max(d.textlength(l, font=f) for l in lines)
    if sub: bw = max(bw, d.textlength(sub, font=fs))
    pad = 44
    off = int((1 - alpha) * 30)
    box = (W/2 - bw/2 - pad, y - pad + off, W/2 + bw/2 + pad, y + th + pad - 12 + off)
    d.rounded_rectangle(box, 34, fill=GREEN + (235,))
    for i, l in enumerate(lines):
        d.text((W/2, y + i * lh + off), l, font=f, fill=CREAM, anchor='ma')
    if sub:
        d.text((W/2, y + lh * len(lines) + 14 + off), sub, font=fs, fill=GOLD, anchor='ma')
    a = layer.split()[3].point(lambda v: int(v * alpha))
    layer.putalpha(a)
    fr.paste(layer, (0, 0), layer)

def chip(fr, text, y, alpha=1.0):
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    f = font('Inter-SemiBold.otf', 38)
    tw = d.textlength(text, font=f)
    d.rounded_rectangle((W/2 - tw/2 - 34, y, W/2 + tw/2 + 34, y + 74), 37, fill=CREAM + (240,), outline=GOLD + (255,), width=3)
    d.text((W/2, y + 37), text, font=f, fill=GREEN, anchor='mm')
    layer.putalpha(layer.split()[3].point(lambda v: int(v * alpha)))
    fr.paste(layer, (0, 0), layer)

def ease(x): return 0.5 - 0.5 * math.cos(math.pi * max(0, min(1, x)))

# scenes timed to the voiceover pauses (seconds)
SCENES = [
    ('hook', 0.0, 2.45, 'Aynada ince çizgiler mi fark ettin?', None),
    ('duo', 2.45, 5.0, 'Akşam rutinine 2 adım yeter', 'Serum + Yüz Bakım Cihazı'),
    ('serum', 5.0, 11.3, '1. Adım: Yaşlanma Karşıtı Serum', 'Defne yaprağı yağı + 10 bitkisel yağ'),
    ('device', 11.3, 17.4, '2. Adım: Yüz Bakım Cihazı', 'Kırmızı ışık · RF · EMS · Isı · Titreşim'),
    ('ritual', 17.4, 20.6, 'Evde birkaç dakikalık bakım ritüeli', None),
    ('price', 20.6, 24.4, None, None),
    ('end', 24.4, 27.0, None, None),
]
DUR = SCENES[-1][2]

def price_frame(t, p):
    fr = BG['duo'].copy()
    paste_card(fr, src['duo'], W//2, 760, 760, 700, 1.0 + 0.04 * p)
    a = ease(t / 0.4)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    off = int((1 - a) * 40)
    d.rounded_rectangle((90, 1170 + off, W - 90, 1560 + off), 40, fill=GREEN + (240,))
    d.text((W/2, 1210 + off), 'Kırışıklık Karşıtı Bakım İkilisi', font=font('Inter-Bold.otf', 50), fill=CREAM, anchor='ma')
    fo = font('Inter-SemiBold.otf', 54)
    old = '5.917 TL'
    ow = d.textlength(old, font=fo)
    d.text((W/2, 1300 + off), old, font=fo, fill=(170, 170, 150), anchor='ma')
    d.line((W/2 - ow/2 - 6, 1332 + off, W/2 + ow/2 + 6, 1332 + off), fill=(210, 120, 110), width=6)
    d.text((W/2, 1375 + off), '2.909 TL', font=font('Inter-ExtraBold.otf', 120), fill=CREAM, anchor='ma')
    # badge
    d.rounded_rectangle((W - 330, 1110 + off, W - 70, 1200 + off), 45, fill=GOLD + (255,))
    d.text((W - 200, 1155 + off), 'Yarı fiyatına', font=font('Inter-Bold.otf', 40), fill=GREEN, anchor='mm')
    layer.putalpha(layer.split()[3].point(lambda v: int(v * a)))
    fr.paste(layer, (0, 0), layer)
    headline(fr, 'Orijinal LYN Skincare', 230, ease(t / 0.35), size=62)
    return fr

def end_frame(t, p):
    fr = Image.new('RGB', (W, H), CREAM)
    a = ease(t / 0.4)
    s = int(420 * (0.92 + 0.08 * a))
    lg = logo.resize((s, s), Image.LANCZOS)
    lg.putalpha(lg.split()[3].point(lambda v: int(v * a)))
    fr.paste(lg, (W//2 - s//2, 460 - s//2 + 210), lg)
    d = ImageDraw.Draw(fr)
    d.text((W/2, 1000), 'Bellapy', font=font('Inter-ExtraBold.otf', 96), fill=GREEN, anchor='ma')
    d.text((W/2, 1120), 'Cilt Bakımı & Güzellik', font=font('Inter-Medium.otf', 46), fill=(120, 110, 90), anchor='ma')
    b = ease((t - 0.3) / 0.4)
    if b > 0:
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dl = ImageDraw.Draw(layer)
        dl.rounded_rectangle((W/2 - 300, 1260, W/2 + 300, 1380), 60, fill=GREEN + (255,))
        dl.text((W/2, 1320), 'Link profilde  →', font=font('Inter-Bold.otf', 56), fill=CREAM, anchor='mm')
        dl.text((W/2, 1430), '@bellapycom', font=font('Inter-SemiBold.otf', 46), fill=GREEN, anchor='ma')
        layer.putalpha(layer.split()[3].point(lambda v: int(v * b)))
        fr.paste(layer, (0, 0), layer)
    return fr

def scene_frame(i, t):
    key, s, e, text, sub = SCENES[i]
    lt, p = t - s, (t - s) / (e - s)
    if key == 'price': return price_frame(lt, p)
    if key == 'end': return end_frame(lt, p)
    fr = BG[key].copy()
    if key == 'hook':
        paste_card(fr, src[key], W//2, 1080, 600, 1050, 1.12 - 0.08 * p)
        headline(fr, text, 300, ease(lt / 0.3), size=84)
    else:
        if key == 'ritual':
            paste_card(fr, src[key], W//2, 1060, 600, 1000, 1.0 + 0.08 * p)
            headline(fr, text, 290, ease(lt / 0.35))
            chip(fr, 'LYN Skincare · Orijinal ürün', 1590, ease((lt - 0.3) / 0.4))
            return fr
        zoom = 1.0 + 0.07 * p
        top = 700 if sub else 640
        paste_card(fr, src[key], W//2, top + 430, 920, 860, zoom)
        headline(fr, text, 290, ease(lt / 0.35), sub=sub)
    chip(fr, 'LYN Skincare · Orijinal ürün', 1590, ease((lt - 0.3) / 0.4))
    return fr

def frame_at(t):
    for i, (k, s, e, *_ ) in enumerate(SCENES):
        if s <= t < e or i == len(SCENES) - 1:
            fr = scene_frame(i, t)
            xf = 0.25
            if i > 0 and t - s < xf:
                prev = scene_frame(i - 1, t)
                fr = Image.blend(prev, fr, ease((t - s) / xf))
            return fr

if PREVIEW:
    for t in [1.2, 3.8, 8.0, 14.0, 19.0, 22.5, 26.0]:
        frame_at(t).save(f'prev_{t:04.1f}.jpg', quality=85)
    sys.exit()

n = int(DUR * FPS)
p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', OUT], stdin=subprocess.PIPE)
for k in range(n):
    p.stdin.write(frame_at(k / FPS).tobytes())
p.stdin.close(); p.wait()
print('done', n)
