import { API_BASE_URL, setOnUnauthorized, setRefreshTokenHandler } from '@/src/lib/api';
import { tokenStorage } from '@/src/lib/secure-storage';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { useTenantStore } from '@/src/shared/store/use-tenant-store';
import axios from 'axios';
import { ReactNode, useEffect } from 'react';

/** Nối auth store với axios: tự refresh token khi 401, hết phiên thì đăng xuất. */
export default function ApiProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    setOnUnauthorized(() => useAuthStore.getState().signOut());

    setRefreshTokenHandler(async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      const tenantId = useTenantStore.getState().tenantId;
      if (!refreshToken || !tenantId) return null;

      // Dùng axios trần (không qua interceptor) để tránh vòng lặp refresh
      const res = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'x-tenant-id': tenantId } },
      );
      const data = res.data?.data ?? res.data;
      await tokenStorage.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken as string;
    });
  }, []);

  return <>{children}</>;
}
