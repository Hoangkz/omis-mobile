import api from '@/src/lib/api';
import { clearCurrentUserId } from '@/src/lib/query-config';
import { tokenStorage } from '@/src/lib/secure-storage';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

export const useLogOut = () => {
  const [isLoading, setIsLoading] = useState(false);
  const signOut = useAuthStore((s) => s.signOut);
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Báo BE vô hiệu hoá refresh token; lỗi mạng thì vẫn đăng xuất local
      const refreshToken = await tokenStorage.getRefreshToken();
      await api.post('/auth/logout', { refreshToken }).catch(() => undefined);
      await clearCurrentUserId(queryClient);
      await signOut();
    } finally {
      setIsLoading(false);
    }
  }, [signOut, queryClient]);

  return { logout, isLoading };
};
