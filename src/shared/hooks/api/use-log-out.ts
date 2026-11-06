import { clearCurrentUserId } from '@/src/lib/query-config';
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
      await clearCurrentUserId(queryClient);
      await signOut();
    } finally {
      setIsLoading(false);
    }
  }, [signOut, queryClient]);

  return { logout, isLoading };
};
