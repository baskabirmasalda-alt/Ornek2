"""Ses dosyasını kelime kelime zamanlarıyla yazıya döker (faster-whisper).

Kullanım: .venv/bin/python yaziya_dok.py assets/b05/ses/anlatim.mp3 [cikti.json] [--model small]
Çıktı: {"words": [{"text", "start", "end", "type": "word"}]} — make_v2.py ve video/hazirla.mjs ile aynı biçim
(ElevenLabs Scribe çıktısıyla da aynı).

Model ilk çalıştırmada huggingface.co'dan indirilir; ağ izni yoksa WHISPER_MODEL_DIR ile önceden indirilmiş
bir CTranslate2 model klasörü verilebilir.
"""
import argparse
import json
import os
import subprocess

import numpy as np

from faster_whisper import WhisperModel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ses")
    ap.add_argument("cikti", nargs="?")
    ap.add_argument("--model", default=os.environ.get("WHISPER_MODEL_DIR", "small"))
    ap.add_argument("--dil", default="tr")
    a = ap.parse_args()
    cikti = a.cikti or os.path.splitext(a.ses)[0] + "_kelimeler.json"

    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    # Ses ffmpeg ile 16 kHz mono'ya çözülür (faster-whisper'ın PyAV sürüm bağımlılığından kaçınmak için)
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", a.ses, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"])
    parcalar, bilgi = model.transcribe(np.frombuffer(raw, np.float32), language=a.dil, word_timestamps=True, vad_filter=True)
    words = []
    for p in parcalar:
        for w in p.words:
            words.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3), "type": "word"})
    json.dump({"words": words}, open(cikti, "w"), ensure_ascii=False, indent=1)
    print(f"Bitti: {cikti} · {len(words)} kelime · {bilgi.duration:.1f} sn")


if __name__ == "__main__":
    main()
