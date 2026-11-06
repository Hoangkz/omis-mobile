import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  if (isSignedIn) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false, gestureEnabled: true }} />;
}
