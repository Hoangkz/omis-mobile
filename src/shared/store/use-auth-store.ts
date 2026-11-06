import type { Role } from '@/src/features/omis/types';
import { tokenStorage, userStorage } from '@/src/lib/secure-storage';
import { useTenantStore } from '@/src/shared/store/use-tenant-store';
import { create } from 'zustand';

export interface AuthUser {
  id: string;
  userName: string;
  name?: string | null;
  email?: string | null;
  /** Vai trò trong app (admin | sale) */
  role: Role;
  /** Role gốc của BE (admin, sales, accountant…) */
  apiRole: string;
  /** id nhân viên sale = id user (chỉ có khi role = sale) */
  saleId?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  /** Khôi phục phiên đăng nhập từ secure storage khi mở app */
  hydrate: () => Promise<void>;
  signIn: (params: { user: AuthUser; accessToken: string; refreshToken?: string | null }) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoaded: false,
  isSignedIn: false,

  hydrate: async () => {
    // tenantId phải sẵn sàng trước mọi request
    await useTenantStore.getState().hydrate();
    const [token, user] = await Promise.all([tokenStorage.getAccessToken(), userStorage.get<AuthUser>()]);
    if (token && user) {
      set({ user, isSignedIn: true, isLoaded: true });
    } else {
      if (token || user) await Promise.all([tokenStorage.clear(), userStorage.clear()]);
      set({ user: null, isSignedIn: false, isLoaded: true });
    }
  },

  signIn: async ({ user, accessToken, refreshToken }) => {
    await tokenStorage.setTokens(accessToken, refreshToken);
    await userStorage.set(user);
    set({ user, isSignedIn: true, isLoaded: true });
  },

  signOut: async () => {
    await Promise.all([tokenStorage.clear(), userStorage.clear()]);
    set({ user: null, isSignedIn: false });
  },
}));
