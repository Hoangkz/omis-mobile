import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const USER_KEY = 'auth_user';

/** Lưu thông tin user (id, role…) để mở lại app không cần gọi /auth/me */
export const userStorage = {
  async get<T>(): Promise<T | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  set: (user: unknown) => SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  clear: () => SecureStore.deleteItemAsync(USER_KEY),
};

export const tokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  async setTokens(accessToken: string, refreshToken?: string | null) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
