import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { TIMEOUT } from './constant';
import { tokenStorage } from './secure-storage';
import { toast } from './toast';

const api = axios.create({
  baseURL: `${Constants.expoConfig?.extra?.apiUrl}/api/v1`,
  timeout: TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Hooks for the auth layer. Set `refreshTokenHandler` to call your refresh endpoint
 * and return a new access token (or null). Set `onUnauthorized` to sign the user out.
 */
let refreshTokenHandler: (() => Promise<string | null>) | null = null;
let onUnauthorized: (() => void | Promise<void>) | null = null;

export const setRefreshTokenHandler = (fn: () => Promise<string | null>) => {
  refreshTokenHandler = fn;
};
export const setOnUnauthorized = (fn: () => void | Promise<void>) => {
  onUnauthorized = fn;
};

let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Accept-Language'] = 'vi';
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry && refreshTokenHandler) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => failedQueue.push({ resolve, reject })).then(
          (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          },
        );
      }

      isRefreshing = true;
      try {
        const newToken = await refreshTokenHandler();
        if (!newToken) throw new Error('Failed to refresh token');
        original.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return await api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        toast.error('errors.sessionExpired', true);
        await onUnauthorized?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
