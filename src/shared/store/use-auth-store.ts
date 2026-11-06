import { tokenStorage } from '@/src/lib/secure-storage';
import type { Role } from '@/src/features/omis/mock-data';
import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  /** id nhân viên sale (mock) */
  saleId?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  /** Restore session from secure storage on app start */
  hydrate: () => Promise<void>;
  signIn: (params: { user: AuthUser; accessToken: string; refreshToken?: string | null }) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoaded: false,
  isSignedIn: false,

  hydrate: async () => {
    const token = await tokenStorage.getAccessToken();
    // MOCK: token có dạng `mock-admin` | `mock-sale-<saleId>`. TODO: thay bằng GET /me
    let user: AuthUser | null = null;
    if (token === 'mock-admin') {
      user = { id: 'admin', email: 'boss@omis.app', name: 'Ông chủ', role: 'admin' };
    } else if (token?.startsWith('mock-sale-')) {
      const saleId = token.replace('mock-sale-', '');
      user = { id: saleId, email: 'sale@omis.app', name: 'Sale', role: 'sale', saleId };
    }
    set({ user, isSignedIn: !!token, isLoaded: true });
  },

  signIn: async ({ user, accessToken, refreshToken }) => {
    await tokenStorage.setTokens(accessToken, refreshToken);
    set({ user, isSignedIn: true, isLoaded: true });
  },

  signOut: async () => {
    await tokenStorage.clear();
    set({ user: null, isSignedIn: false });
  },
}));
