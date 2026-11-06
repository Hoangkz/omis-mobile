// `npm run start`: nối adb tới MEmu (nếu có) rồi chạy Expo Go với hot reload.
const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const DEVICE = process.env.EMULATOR_ADDR || '127.0.0.1:21503';
const sdk = path.resolve(__dirname, '..', '..', '.tools', 'android-sdk');
const adbDir = path.join(sdk, 'platform-tools');
const env = { ...process.env };

if (fs.existsSync(path.join(adbDir, 'adb.exe'))) {
  env.ANDROID_HOME = sdk;
  const pathKey = Object.keys(env).find((k) => k.toLowerCase() === "path") || "PATH";
  env[pathKey] = `${env[pathKey] || ""}${path.delimiter}${adbDir}`;
  const adb = path.join(adbDir, 'adb.exe');
  spawnSync(adb, ['connect', DEVICE], { stdio: 'inherit' });
  spawnSync(adb, ['-s', DEVICE, 'reverse', 'tcp:8081', 'tcp:8081'], { stdio: 'inherit' });
}

const args = ['expo', 'start', '--go', '--android', '--port', '8081', ...process.argv.slice(2)];
spawn('npx', args, { stdio: 'inherit', env, shell: true }).on('exit', (c) => process.exit(c ?? 0));
