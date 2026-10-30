#!/bin/bash
# Başka Bir Masalda – bulut oturumu açılırken araçları kurar (Remotion, yt-dlp, faster-whisper).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Python araçları (sanal ortam, bir kez kurulur, sonra önbellekten gelir)
if [ ! -x .venv/bin/python ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt

# Remotion (Node)
(cd video && npm install --no-audit --no-fund --loglevel=error)

command -v ffmpeg >/dev/null || echo "UYARI: ffmpeg bulunamadı" >&2

echo "export PATH=\"$CLAUDE_PROJECT_DIR/.venv/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
