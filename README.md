# omis-mobile

React Native (Expo SDK 54) base app, modeled on `6th-floor-mobile-app`.

## Stack
- Expo 54 + expo-router (typed routes), React 19, React Compiler, New Architecture
- NativeWind v4 + Tailwind 3 + shadcn-style UI (`@rn-primitives/*`) in `src/shared/components/ui`
- TanStack Query (persisted via AsyncStorage), Zustand, axios, react-hook-form + zod
- i18next (en/de, typed keys), toast, dark mode, Outfit font
- EAS build profiles (development / staging / production) driven by `APP_VARIANT`

## Getting started
```bash
cp .env.example .env     # set EXPO_PUBLIC_API_URL_*
npm install --legacy-peer-deps
npx expo prebuild        # dev client needed (expo-dev-client)
npm run android          # or: npm run ios
```
Scripts: `npm run typecheck`, `npm run lint`.

## Structure
```
src/
  app/            expo-router routes: (auth)/ public, (authenticated)/ tabs
  features/       feature modules (add yours: components, hooks, schema, views)
  lib/            api (axios + refresh queue), query-config, toast, theme, secure-storage
  locales/        en.json, de.json, i18n.ts
  shared/         components/ui, view-wrapper, providers, hooks, store, schema, types
```

## Auth
Provider-agnostic: tokens in `expo-secure-store`, session in `use-auth-store`.
TODO to wire your backend: `hydrate()` (fetch current user), the login screen, and
`setRefreshTokenHandler` in `shared/providers/api-provider.tsx`.

## Before shipping
- Replace app name, `scheme`, bundle id (`com.omis.app`) in `app.json` / `app.config.ts`
- Replace icons/splash in `assets/images`, brand colors in `src/global.css` + `src/lib/theme.ts`
- Run `eas init` and set `extra.eas.projectId`; add `updates.url` for OTA
- Add Sentry / push notifications / Supabase etc. only if needed (intentionally left out)
