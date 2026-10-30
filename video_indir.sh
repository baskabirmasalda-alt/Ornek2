#!/bin/bash
# Video indirir (yt-dlp + ffmpeg). Kullanım: ./video_indir.sh <url> [hedef_klasor]
# Örnek: ./video_indir.sh "https://www.youtube.com/watch?v=..." indirilen
# Not: youtube.com'a erişim ortamın ağ iznine bağlıdır.
set -euo pipefail
URL="$1"
HEDEF="${2:-indirilen}"
mkdir -p "$HEDEF"
"$(dirname "$0")/.venv/bin/yt-dlp" \
  -f "bv*[height<=1080]+ba/b[height<=1080]" \
  --merge-output-format mp4 \
  --ffmpeg-location "$(command -v ffmpeg)" \
  -o "$HEDEF/%(title).80s [%(id)s].%(ext)s" \
  "$URL"
