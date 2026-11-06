import { NAV_THEME } from "@/src/lib/theme";
import { useReactNavigationDevTools } from "@dev-plugins/react-navigation";
import { ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack, useNavigationContainerRef } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "../hooks/utils/use-color-schema";

export default function RootLayoutNavProvider() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  /* Navigation devtools */
  const navigationRef = useNavigationContainerRef();
  // kiểu ref của thư viện devtools chưa khớp với react-navigation mới
  useReactNavigationDevTools(navigationRef as never);

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? "light" : "dark"}`}
        style={isDarkColorScheme ? "light" : "dark"}
      />

      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <SafeAreaProvider>
          <Stack
            ref={navigationRef}
            screenOptions={{
              gestureEnabled: true,
              headerShown: false,
            }}
          />
        </SafeAreaProvider>

        {/*  PortalHost for modals and other portal components */}
        <PortalHost />
        <PortalHost name="drawer-portal" />
      </NavThemeProvider>
    </>
  );
}
