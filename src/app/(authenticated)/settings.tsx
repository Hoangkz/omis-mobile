import { Btn, Card, Row, Screen, Txt } from '@/src/features/omis/components';
import { C } from '@/src/features/omis/theme';
import { useLogOut } from '@/src/shared/hooks/api/use-log-out';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { LogOut } from 'lucide-react-native';
import { View } from 'react-native';

export default function SettingsScreen() {
  const { logout, isLoading } = useLogOut();
  const user = useAuthStore((s) => s.user);

  return (
    <Screen title="Cài đặt" subtitle="Tài khoản & phiên đăng nhập">
      <Card>
        <View style={{ alignItems: 'center', gap: 6, paddingBottom: 8 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Txt size={26} weight="800" color={C.primary}>
              {(user?.name ?? 'U').charAt(0)}
            </Txt>
          </View>
          <Txt size={17} weight="800">
            {user?.name}
          </Txt>
          <Txt size={12} color={C.sub}>
            {user?.email ?? user?.userName}
          </Txt>
        </View>
        <Row label="Vai trò" value={user?.role === 'admin' ? 'Admin (Boss)' : 'Sale'} />
        <Row label="Phiên bản" value="1.0.0" />
      </Card>
      <Btn tone="danger" label="Đăng xuất" onPress={logout} disabled={isLoading} icon={<LogOut size={18} color="#fff" />} />
    </Screen>
  );
}
