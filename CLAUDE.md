# Başka Bir Masalda – video üretim projesi

Türkçe YouTube kanalı **Başka Bir Masalda** (@baskabirmasalda, kanal ID `UCVwJcWAtWAx7ZjMR6igBogg`) için
uzun bölüm, Shorts, kapak ve yükleme metinleri bu klasörde üretilir. Konsept: "masalların bilinmeyen yüzü";
13+ / yetişkin kitle, ailece izlenebilir, çocuklar için yapılmamış.

## Önce oku
- `plan/STIL_REHBERI.md` – ton (kan/şiddet yok), senaryo yapısı, görsel tarz, Shorts kuralları, kredi tasarrufu
- `plan/BOLUMLER.md` – bölüm listesi · `plan/KANAL_KURULUM.md` – kanal ayarları
- `plan/senaryo_epNN_uzun.md` – senaryolar (kaynak notlarıyla) · `plan/yukleme_bNN.md` – başlık/açıklama/etiket
- `.claude/youtube/voice.md` – kanalın anlatım üslubu (yt-* komutları okur)

## Klasörler
- `assets/bNN/` – bölüm başına ses (`ses/`), sahne görselleri (`sahneler/sNN.png`), klipler, müzik, efektler
- `video/` – **Remotion** projesi (kodla animasyon, React/TypeScript)
- `.claude/skills/yt-*` – YouTube analiz komutları (retention, viral, comment, package, script)

## Araçlar
| Araç | Kullanım |
| --- | --- |
| `make_v2.py` | Yeni tempo render (Python/Pillow): `python3 make_v2.py plan/kurgu_b05_pilot.json` |
| `video/` (Remotion) | `cd video && node hazirla.mjs ../plan/kurgu_X.json src/veri/X.json` → `npx remotion render src/Root.tsx <Kompozisyon> out/x.mp4` · Önizleme: `npx remotion studio src/Root.tsx` |
| `video/kontrol_sayfasi.mjs` | Render öncesi kontrol: her plandan bir kare, tek sayfa: `node kontrol_sayfasi.mjs <Kompozisyon> src/veri/X.json kontrol.jpg [ek_sn...]` |
| `video/src/cizim/` | Görsel modeli olmadan kodla (SVG) çizilen sahne ve karakterler (`KarlarKralicesiCizim`, `KarakterSayfasi`) |
| `yaziya_dok.py` | Kelime zamanlı yazıya dökme (faster-whisper): `.venv/bin/python yaziya_dok.py ses.mp3` |
| `video_indir.sh` | Video indirme (yt-dlp + ffmpeg): `./video_indir.sh <url>` |
| `make_kapak.py` | Kapak (1280x720), `make_marka.py` banner/logo, `make_uzun.py`/`make_shorts.py` eski düzen |

Kurgu dosyası (`plan/kurgu_*.json`) her iki render aracında aynıdır: planlar/vurgular/efektler anlatımdaki
söz öbeklerine bağlanır, zamanı kelime dökümünden bulunur.

## Ortam notları
- Bulut oturumunda `.claude/hooks/session-start.sh` Python sanal ortamını (`.venv`) ve Remotion'u kurar.
- Remotion önceden kurulu Chromium'u kullanır (`video/remotion.config.ts`, `REMOTION_CHROME` ile değiştirilebilir).
- whisper modelleri `huggingface.co` ve `*.hf.co`'dan iner (açık). `yaziya_dok.py` ~35 sn'de 1 dk sesi çözer.
- yt-dlp `youtube.com` listelerini/bilgilerini okur (`--flat-playlist --print`), ama bu ortamda video indirme
  YouTube tarafından 403 ile engelleniyor (veri merkezi IP'si). İndirilecek videoyu kullanıcı yükler.
- Görsel, ses, müzik üretimi ElevenLabs bağlantısıyla yapılır; kredi kurallarına uy (stil rehberi).
- Büyük çıktılar git'e girmez (`*_uzun.mp4`, `.venv`, `node_modules`); GitHub için `_github.mp4` sıkıştırılmış kopya (crf 29).
- Commit mesajları Türkçe.
