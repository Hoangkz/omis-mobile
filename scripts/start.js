// `npm run start`: nối adb tới MEmu (nếu có) rồi chạy Expo Go với hot reload.
const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Nạp .env trước (không ghi đè biến đã có sẵn trong môi trường)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

const DEVICE = process.env.EMULATOR_ADDR || '127.0.0.1:21503';
const sdk = path.resolve(__dirname, '..', '..', '.tools', 'android-sdk');
const adbDir = path.join(sdk, 'platform-tools');
const env = { ...process.env };

// Giá trị mặc định cho các biến còn thiếu (đọc bởi app.config.js).
// Biến nào đã có trong .env / môi trường thì giữ nguyên.
const DEFAULT_ENV = {
  APP_VARIANT: 'development', // development | staging | production
  APP_VERSION: '1.0.0',
  EXPO_PUBLIC_API_URL_DEV: 'http://localhost:8080',
  EXPO_PUBLIC_API_URL_STAGING: 'https://api-staging.example.com',
  EXPO_PUBLIC_API_URL_PRODUCTION: 'https://api.example.com',
  EXPO_NO_TELEMETRY: '1', // tắt hỏi/gửi telemetry của Expo khi chạy script
};
for (const [key, value] of Object.entries(DEFAULT_ENV)) {
  if (!env[key]) env[key] = value;
}

if (fs.existsSync(path.join(adbDir, 'adb.exe'))) {
  env.ANDROID_HOME = sdk;
  env.ANDROID_SDK_ROOT = sdk;
  const pathKey = Object.keys(env).find((k) => k.toLowerCase() === "path") || "PATH";
  env[pathKey] = `${env[pathKey] || ""}${path.delimiter}${adbDir}`;
  const adb = path.join(adbDir, 'adb.exe');
  spawnSync(adb, ['connect', DEVICE], { stdio: 'inherit' });
  spawnSync(adb, ['-s', DEVICE, 'reverse', 'tcp:8081', 'tcp:8081'], { stdio: 'inherit' });
  // máy ảo gọi được BE chạy trên máy host (localhost:8080)
  spawnSync(adb, ['-s', DEVICE, 'reverse', 'tcp:8080', 'tcp:8080'], { stdio: 'inherit' });
}

const args = ['expo', 'start', '--go', '--android', '--port', '8081', ...process.argv.slice(2)];
spawn('npx', args, { stdio: 'inherit', env, shell: true }).on('exit', (c) => process.exit(c ?? 0));
