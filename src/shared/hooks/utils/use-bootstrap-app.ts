import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

/** Loads fonts and restores the session, then hides the splash screen. */
export const useBootstrapApp = () => {
  const [isReady, setIsReady] = useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthLoaded = useAuthStore((s) => s.isLoaded);

  const [fontsLoaded, fontError] = useFonts({
    'Outfit-Thin': require('../../../../assets/fonts/Outfit-Thin.ttf'),
    'Outfit-ExtraLight': require('../../../../assets/fonts/Outfit-ExtraLight.ttf'),
    'Outfit-Light': require('../../../../assets/fonts/Outfit-Light.ttf'),
    'Outfit-Regular': require('../../../../assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Medium': require('../../../../assets/fonts/Outfit-Medium.ttf'),
    'Outfit-SemiBold': require('../../../../assets/fonts/Outfit-SemiBold.ttf'),
    'Outfit-Bold': require('../../../../assets/fonts/Outfit-Bold.ttf'),
    'Outfit-ExtraBold': require('../../../../assets/fonts/Outfit-ExtraBold.ttf'),
    'Outfit-Black': require('../../../../assets/fonts/Outfit-Black.ttf'),
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isAuthLoaded) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [fontsLoaded, fontError, isAuthLoaded]);

  return { isReady };
};
