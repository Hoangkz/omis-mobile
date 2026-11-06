require('dotenv/config');

/** @param {{ config: import('expo/config').ExpoConfig }} params */
module.exports = ({ config }) => {
  /** @type {'development' | 'staging' | 'production'} */
  const APP_VARIANT = process.env.APP_VARIANT || 'development';

  // Suffix the bundle id per environment so variants can be installed side by side
  const suffix = APP_VARIANT === 'production' ? '' : APP_VARIANT === 'staging' ? '.staging' : '.dev';
  const bundleId = `com.omis.app${suffix}`;

  const apiUrl =
    APP_VARIANT === 'production'
      ? process.env.EXPO_PUBLIC_API_URL_PRODUCTION
      : APP_VARIANT === 'staging'
        ? process.env.EXPO_PUBLIC_API_URL_STAGING
        : process.env.EXPO_PUBLIC_API_URL_DEV || 'http://localhost:8080';

  return {
    ...config,
    version: process.env.APP_VERSION || '1.0.0',
    name: APP_VARIANT === 'production' ? 'OMIS' : `OMIS (${APP_VARIANT})`,
    ios: { ...config.ios, bundleIdentifier: bundleId },
    android: { ...config.android, package: bundleId },
    extra: {
      ...config.extra,
      apiUrl,
      appVariant: APP_VARIANT,
      appVersion: process.env.APP_VERSION || '1.0.0',
      // eas: { projectId: '<run `eas init`>' },
    },
  };
};
