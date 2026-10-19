# Başka Bir Masalda – Stil Rehberi

Her bölüm bu kurallara göre üretilir. Değişiklik olursa önce burası güncellenir.

## Ton
- Kitle: 13+ gençler ve yetişkinler, ailece izlenebilir. "Çocuklar için yapılmadı" olarak yüklenir.
- **Kan, şiddet, yaralama, vahşet yok; ne görselde ne anlatımda.** Orijinal masaldaki sert ayrıntılar
  atlanır ya da tek cümleyle yumuşak geçilir. Kanca şok değil, şaşırtıcı bilgiyle kurulur.
- Merak uyandırıcı, sıcak, hafif ironik. Korku değil.

## Senaryo yapısı (8–10 dk, ~1000 kelime)
1. **Kanca (0:00–0:30):** "Bu masalı bildiğini sanıyorsun..." + şaşırtıcı bilgi + "sonuncusu hiçbir kitapta yok".
2. **Açılış (kısa):** anlatıcı kendini tanıtır, kanalın sözü.
3. **Gerçek kökenler:** 2–3 tarihî versiyon, her biri yıl ve yer ile ("Yıl 1697. Paris.").
4. **Başka bir masalda:** kanalın özgün, ters köşe yeniden anlatımı; şefkatli bakış açısı.
5. **Kapanış:** yorum sorusu + şapkalı gizemli adam (seri bağlantısı) + abone çağrısı.
- Bilgiler kaynaktan doğrulanır; senaryonun sonuna kaynak notu eklenir.
- Senaryo biçimi: `### bölüm` = bir seslendirme parçası; `[SAHNE n: ...]` = o satırdan sonraki anlatımda gösterilecek görsel.

## Görsel tarz: E – sıcak, aydınlık yağlı boya
Her sahne komutunun başına eklenir:

> Wide 16:9 landscape painterly digital oil painting, bright and warm, like a classic illustrated fairy tale
> for adults: rich saturated colors, soft golden light, visible brush strokes, warm amber and honey tones,
> high clarity, no gloom. Natural proportions, not cute, not chibi. No blood, no violence, no text.

- Gizemli sahnelerde: "warm dusk light, long soft shadows" (karanlık değil, akşam ışığı).
- Her bölümde önce **karakter referans sayfası** üretilir ve tüm sahnelere referans olarak bağlanır.
- Model: `gemini-3.1-flash-image` (referanslı ~609 kredi/görsel).
- Gemini, ünlü film sahnelerine çok benzeyen kareleri (ör. balkabağı araba, gece yarısı merdiveni) güvenlik
  filtresine takabilir. Engellenen sahneler `bytedance-seedream-4.5` ile üretilir (~242 kredi, 16:9 2K;
  1376x768'e küçültülür). Karakter referans sayfasında yaş etiketi kullanılmaz.
- Örnek: `assets/stil_test/e_sicak_yagliboya.png`, `assets/b02/ornek_sahne_e.png`.

## Kapak (1280x720)
- En fazla 2–3 kelimelik büyük yazı: beyaz + sarı (255,205,70), kalın siyah kontur; altında kırmızı etiket.
- Yazı solda, ana karakterin yüzü yazının altında kalmaz.
- Merak boşluğu: "CAM DEĞİLDİ!", "AVCI YOKTU!" gibi şaşırtıcı ama zararsız bilgi.

## Başlık ve açıklama
- Başlıkta bilinen masal adı + "gerçek / bilinmeyen / aslında" (YouTube aramasından geliyoruz).
- vidIQ ile başlık puanlama ve anahtar kelime kontrolü yapılır.
- Açıklamada bölüm zaman damgaları, kaynaklar ve yapay zekâ kullanım notu.
- Kaynakların üstüne her bölümde aynı not: tarihî bilgiler en eski yazılı kaynaklara dayanır, "Başka bir masalda"
  kanalın özgün yorumudur; izleyici bildiği farklı versiyonu yorumlarda paylaşmaya davet edilir.

## Shorts
- Uzun videodan 3 parça, 20–35 sn; ilk cümle soru ya da şaşırtıcı bilgi.
- Sonda "Tamamı kanalda ▶" kartı; "İlgili video" olarak uzun video seçilir.

## Ses
- Anlatıcı: Fatih Çetinkaya (ElevenLabs, `DM4ogDUNaqwcuIIRkVZK`), model eleven_v4.
- Müzik: sakin masal fonu, ses -14 LUFS.
