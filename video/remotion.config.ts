import fs from 'node:fs';
import {Config} from '@remotion/cli/config';

// Bulut ortamında önceden kurulu Chromium kullanılır; kişisel bilgisayarda bu yol yoksa Remotion kendi tarayıcısını indirir.
const tarayici = process.env.REMOTION_CHROME ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(tarayici)) Config.setBrowserExecutable(tarayici);
Config.setVideoImageFormat('jpeg');
Config.setConcurrency(4);
