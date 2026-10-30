# Devir notu – bulut oturumundan bilgisayara (30 Ekim 2026)

Yeni oturumda Claude'a ilk mesaj olarak şunu yaz:
> CLAUDE.md, plan/DEVIR_NOTU.md, plan/STIL_REHBERI.md ve plan/chatgpt_komutlari_b05.md dosyalarını oku, kaldığımız yerden devam et.

## Bilgisayarda kurulum (Claude bunları kendisi de yapabilir)
1. Gerekenler: Git, Python 3.11+, Node.js 20+, ffmpeg.
   - Mac: `brew install git python node ffmpeg` · Windows: `winget install Git.Git Python.Python.3.12 OpenJS.NodeJS.LTS Gyan.FFmpeg`
2. `git clone https://github.com/baskabirmasalda-alt/Ornek2.git && cd Ornek2 && git checkout claude/youtube-shorts-video-ek8wbd`
3. `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt` (Windows: `.venv\Scripts\pip install -r requirements.txt`)
4. `cd video && npm install` (Remotion ilk render'da kendi tarayıcısını indirir)
5. Claude masaüstü uygulamasında bu klasörü aç; Chrome'da **Claude in Chrome** uzantısını kur ve ChatGPT'ye giriş yap.

Git'te olmayanlar: `*_uzun.mp4` bitmiş videolar, `.venv`, `node_modules` (yeniden kurulur). Tüm sahne görselleri,
sesler, müzik ve senaryolar git'te.

## Kanal ve kurallar (özet)
- "Başka Bir Masalda", masalların bilinmeyen yüzü, 13+ ama ailece izlenebilir. **Kan/şiddet yok, korkutucu değil.**
- Görsel tarz: önceki videolardaki **sıcak, aydınlık yağlı boya** (kodla çizim denendi, kullanıcı beğenmedi: "pastel gibi").
- Kullanıcının istemediği: mor-mavi gradyan gökyüzü, uçuşan parıltı/parçacık, ortalanmış dev başlık, rüzgâr sesi,
  çok fısıltı. Karakter ayrıntıları karakter sayfasıyla aynı kalmalı.
- Commit mesajları Türkçe; çalışma dalı `claude/youtube-shorts-video-ek8wbd`.

## Durum
| Bölüm | Durum |
| --- | --- |
| 1–3 (Kırmızı Başlıklı Kız, Külkedisi, Pamuk Prenses) | Yayında |
| 4 Alaaddin | Hazır (`plan/yukleme_b04.md`), yükleme bekliyor |
| 5 Karlar Kraliçesi | Senaryo hazır (`plan/senaryo_ep05_uzun.md`, fısıltısız). 9 görsel var (s01–s09). Pilot ses var (fısıltılı). |

## Sıradaki iş: Karlar Kraliçesi tam bölüm
1. **Görseller (ChatGPT, kullanıcının hesabı):** `plan/chatgpt_komutlari_b05.md` → s07 (yeniden), s10–s22.
   Başlangıç mesajına `assets/b05/karakterler.png` ve `assets/b05/sahneler/s05.png` eklenir. Her görsel karakter
   sayfasıyla karşılaştırılır (yüz, saç, kıyafet); `assets/b05/sahneler/sNN.png` olarak 1376x768'e küçültülüp kaydedilir.
2. **Seslendirme:** ElevenLabs kredisi bitti (yenilenme ~17–18 Kasım, Subscription → "Resets on"). Senaryo 6 parça,
   tek alım, fısıltı yok. Kullanıcı onayı olmadan TTS yapılmaz. Kelime zamanları: `.venv/bin/python yaziya_dok.py ses.mp3`.
3. **Kurgu:** `plan/kurgu_b05_pilot.json` örnek; tam bölüm için `plan/kurgu_b05_uzun.json` yazılır →
   `cd video && node hazirla.mjs ../plan/kurgu_b05_uzun.json src/veri/b05_uzun.json`, Root.tsx'e kompozisyon eklenir
   (Masal bileşeni; Kar ve KuzeyIsiklari katmanlarını kapat).
4. **Render öncesi kontrol:** `node kontrol_sayfasi.mjs <Kompozisyon> src/veri/X.json kontrol.jpg` → hataları bul, düzelt.
5. Render, kapak (`make_kapak.py`), 3 Shorts (≤25 sn, ilk cümle soru), yükleme metni (`plan/yukleme_b05.md` hazır).

## Analiz
`plan/KANAL_ANALIZ_2026-10-30.md`: para kazanma yol haritası. Supermetrics bağlantısı ile YouTube verisi okunur
(kaynak YT2, kanal UCVwJcWAtWAx7ZjMR6igBogg; veri 2–3 gün gecikmeli).
Bekleyen öneriler: eski çocuk videolarını gizle, Shorts'lara "İlgili video" bağla, Alaaddin'i yükle, aylık derleme.
