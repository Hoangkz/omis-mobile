
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import LoadingIcon from '../components/ui/loading-icon';
import { Text } from '../components/ui/text';
import Container from '../components/view-wrapper/container';
import { useTranslation } from '../hooks/utils/use-translation';

export default function NetworkProvider() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;

      // Only update if state actually changed
      if (isConnected !== null && isConnected !== connected) {
        if (!connected && !hasShownOfflineToast) {
          // Device went offline
          setHasShownOfflineToast(true);
        } else if (connected && hasShownOfflineToast) {
          // Device came back online
          setHasShownOfflineToast(false);
        }
      }

      setIsConnected(connected);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [isConnected, hasShownOfflineToast]);

  return (
    <>
      {isConnected === false && (
        <Container className="absolute inset-0 z-50 bg-light-primary-background justify-center items-center">
          <View className="gap-3">
            <View className="flex-row justify-center"><LoadingIcon size={40} /></View>
            <Text className="text-center">
              {t('errors.noInternet')}
            </Text>
          </View>
        </Container>
      )}
    </>
  )
}
