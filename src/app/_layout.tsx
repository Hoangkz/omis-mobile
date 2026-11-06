import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '../global.css';
import LoadingScreen from '../shared/components/ui/loading-screen';
import { useBootstrapApp } from '../shared/hooks/utils/use-bootstrap-app';
import ApiProvider from '../shared/providers/api-provider';
import NetworkProvider from '../shared/providers/network-provider';
import ReactQueryProvider from '../shared/providers/query-provider';
import RootLayoutNavProvider from '../shared/providers/root-layout-nav-provider';
import ToastProvider from '../shared/providers/toast-provider';

// Keep the splash screen visible until fonts / session are ready
SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const { isReady } = useBootstrapApp();

  if (!isReady) return <LoadingScreen />;

  return (
    <ReactQueryProvider>
      <ApiProvider>
        <ToastProvider>
          <NetworkProvider />
          <KeyboardProvider>
            <GestureHandlerRootView>
              <RootLayoutNavProvider />
            </GestureHandlerRootView>
          </KeyboardProvider>
        </ToastProvider>
      </ApiProvider>
    </ReactQueryProvider>
  );
}
