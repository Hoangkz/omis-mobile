import { setOnUnauthorized, setRefreshTokenHandler } from '@/src/lib/api';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { ReactNode, useEffect } from 'react';

/** Connects the auth store with the axios client (token refresh / forced sign-out). */
export default function ApiProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    setOnUnauthorized(() => useAuthStore.getState().signOut());
    // TODO: implement with your refresh endpoint, e.g.
    // setRefreshTokenHandler(async () => { ...; return newAccessToken; });
    setRefreshTokenHandler(async () => null);
  }, []);

  return <>{children}</>;
}
