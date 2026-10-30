import {Config} from '@remotion/cli/config';

// Bulut ortamında önceden kurulu Chromium kullanılır (Remotion'un kendi tarayıcı indirmesine gerek yok).
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
Config.setVideoImageFormat('jpeg');
Config.setConcurrency(4);
