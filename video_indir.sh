#!/bin/bash
# Video indirir (yt-dlp + ffmpeg). Kullanım: ./video_indir.sh <url> [hedef_klasor]
# Örnek: ./video_indir.sh "https://www.youtube.com/watch?v=..." indirilen
# Not: youtube.com erişimi ağ iznine bağlıdır. Bulut ortamında YouTube video verisini (googlevideo) 403 ile
# reddedebiliyor (veri merkezi IP engeli); başlık/izlenme gibi bilgiler çalışır: yt-dlp --flat-playlist --print ...
set -euo pipefail
URL="$1"
HEDEF="${2:-indirilen}"
mkdir -p "$HEDEF"
"$(dirname "$0")/.venv/bin/yt-dlp" \
  --js-runtimes node \
  -f "bv*[height<=1080]+ba/b[height<=1080]" \
  --merge-output-format mp4 \
  --ffmpeg-location "$(command -v ffmpeg)" \
  -o "$HEDEF/%(title).80s [%(id)s].%(ext)s" \
  "$URL"
