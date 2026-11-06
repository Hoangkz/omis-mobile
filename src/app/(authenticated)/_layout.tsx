import { C } from '@/src/features/omis/theme';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { Redirect, Tabs } from 'expo-router';
import {
  Calculator,
  ChartColumn,
  ClipboardCheck,
  Coins,
  Settings,
  ShoppingCart,
  Target,
  type LucideIcon,
} from 'lucide-react-native';

const icon = (Icon: LucideIcon) => {
  const TabIcon = ({ color, focused }: { color: string; focused: boolean }) => (
    <Icon size={24} color={color} strokeWidth={focused ? 2.4 : 1.8} />
  );
  return TabIcon;
};

export default function AuthenticatedLayout() {
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const role = useAuthStore((s) => s.user?.role);

  if (!isSignedIn) return <Redirect href="/login" />;

  const admin = role === 'admin';
  // href: null => ẩn khỏi tab bar nhưng vẫn điều hướng được
  const only = (visible: boolean) => (visible ? undefined : null);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: C.bg },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.sub,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { borderTopColor: C.line, backgroundColor: '#fff', height: 64, paddingTop: 6 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Báo cáo', tabBarIcon: icon(ChartColumn), href: only(admin) }} />
      <Tabs.Screen name="orders" options={{ title: 'Đơn hàng', tabBarIcon: icon(ShoppingCart) }} />
      <Tabs.Screen name="approvals" options={{ title: 'Phê duyệt', tabBarIcon: icon(ClipboardCheck), href: only(admin) }} />
      <Tabs.Screen name="revenue" options={{ title: 'Doanh thu', tabBarIcon: icon(Coins), href: only(admin) }} />
      <Tabs.Screen name="costs" options={{ title: 'Chi phí', tabBarIcon: icon(Calculator), href: only(admin) }} />
      <Tabs.Screen name="kpi" options={{ title: 'KPIs', tabBarIcon: icon(Target), href: only(!admin) }} />
      <Tabs.Screen name="settings" options={{ title: 'Cài đặt', tabBarIcon: icon(Settings) }} />
    </Tabs>
  );
}
