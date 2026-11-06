import { Btn, Field, Txt } from '@/src/features/omis/components';
import { SALES } from '@/src/features/omis/mock-data';
import { C } from '@/src/features/omis/theme';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { Factory } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** MOCK: 2 tài khoản cố định, mỗi tài khoản một quyền. TODO: thay bằng API đăng nhập. */
const MOCK_ACCOUNTS = [
  {
    username: 'admin',
    password: 'admin123',
    token: 'mock-admin',
    user: { id: 'admin', email: 'admin@omis.app', name: 'Ông chủ', role: 'admin' as const },
  },
  {
    username: 'sale',
    password: 'sale123',
    token: `mock-sale-${SALES[0].id}`,
    user: { id: SALES[0].id, email: 'sale@omis.app', name: SALES[0].name, role: 'sale' as const, saleId: SALES[0].id },
  },
];

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const login = (u: string, p: string) => {
    const acc = MOCK_ACCOUNTS.find((x) => x.username === u.trim().toLowerCase() && x.password === p);
    if (!acc) {
      setError('Sai tài khoản hoặc mật khẩu');
      return;
    }
    setError('');
    signIn({ user: acc.user, accessToken: acc.token });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <View
            style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' }}
          >
            <Factory size={38} color={C.primary} strokeWidth={1.8} />
          </View>
          <Txt size={34} weight="800" color={C.primary}>
            Omis
          </Txt>
          <Txt size={13} color={C.sub}>
            Trợ lý Ông chủ
          </Txt>
        </View>

        <Txt size={13} weight="700" color={C.sub} style={{ letterSpacing: 1, marginBottom: 14 }}>
          ĐĂNG NHẬP
        </Txt>

        <View style={{ gap: 14 }}>
          <Field label="Tên đăng nhập" value={user} onChangeText={setUser} placeholder="Nhập tên đăng nhập" />
          <Field label="Mật khẩu" value={pass} onChangeText={setPass} placeholder="Nhập mật khẩu" secureTextEntry />
          {error ? (
            <Txt size={12} color={C.red}>
              {error}
            </Txt>
          ) : null}
          <Btn label="Đăng nhập" onPress={() => login(user, pass)} style={{ marginTop: 6 }} />
          <Txt size={13} color={C.primary} align="center" style={{ marginTop: 4 }}>
            Quên mật khẩu
          </Txt>
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingTop: 30 }}>
          <Txt size={12} color={C.sub}>
            Copyright @ 2026 SENKI.JSC
          </Txt>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
