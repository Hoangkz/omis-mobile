import { Btn, Field, Txt } from '@/src/features/omis/components';
import { SALES } from '@/src/features/omis/mock-data';
import { QrScannerModal } from '@/src/features/omis/qr-scanner';
import { C } from '@/src/features/omis/theme';
import { parseTenantQr } from '@/src/lib/tenant-storage';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { useTenantStore } from '@/src/shared/store/use-tenant-store';
import { Factory, QrCode } from 'lucide-react-native';
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

  const tenantId = useTenantStore((s) => s.tenantId);
  const setTenantId = useTenantStore((s) => s.setTenantId);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');

  const signInWith = (acc: (typeof MOCK_ACCOUNTS)[number]) => signIn({ user: acc.user, accessToken: acc.token });

  const login = (u: string, p: string) => {
    const acc = MOCK_ACCOUNTS.find((x) => x.username === u.trim().toLowerCase() && x.password === p);
    if (!acc) {
      setError('Sai tài khoản hoặc mật khẩu');
      return;
    }
    setError('');
    signInWith(acc);
  };

  const onPressLogin = () => {
    // Chưa có tenantId → bắt buộc quét QR trước khi đăng nhập
    if (!tenantId) {
      setError('Vui lòng quét mã QR bên dưới để đăng nhập.');
      return;
    }
    login(user, pass);
  };

  const onScanned = async (raw: string) => {
    const parsed = parseTenantQr(raw);
    if (!parsed) {
      setScanError('Mã QR không hợp lệ');
      return;
    }
    await setTenantId(parsed.tenantId);
    setScanning(false);
    setScanError('');
    setError('');

    // QR kèm role → đăng nhập nhanh luôn (mock)
    const quick = parsed.role && MOCK_ACCOUNTS.find((a) => a.user.role === parsed.role);
    if (quick) {
      signInWith(quick);
      return;
    }
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
          <Btn label="Đăng nhập" onPress={onPressLogin} style={{ marginTop: 6 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
            <Txt size={12} color={C.sub}>
              hoặc
            </Txt>
            <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
          </View>
          <Btn
            tone="ghost"
            label="Quét QR đăng nhập nhanh"
            icon={<QrCode size={20} color={C.primary} />}
            onPress={() => {
              setScanError('');
              setScanning(true);
            }}
          />
          {tenantId ? (
            <Txt size={11} color={C.sub} align="center">
              Doanh nghiệp: <Txt size={11} weight="700" color={C.text}>{tenantId}</Txt>
            </Txt>
          ) : null}
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

      <QrScannerModal visible={scanning} error={scanError} onScanned={onScanned} onClose={() => setScanning(false)} />
    </KeyboardAvoidingView>
  );
}
