import { Btn, Field, Txt } from '@/src/features/omis/components';
import { QrScannerModal } from '@/src/features/omis/qr-scanner';
import { C } from '@/src/features/omis/theme';
import { mapRole } from '@/src/features/omis/types';
import api from '@/src/lib/api';
import { getApiErrorMessage } from '@/src/lib/api-error';
import { tokenStorage } from '@/src/lib/secure-storage';
import { parseTenantQr } from '@/src/lib/tenant-storage';
import { useAuthStore, type AuthUser } from '@/src/shared/store/use-auth-store';
import { useTenantStore } from '@/src/shared/store/use-tenant-store';
import { Factory, QrCode } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
interface MeResponse {
  id: string;
  userName: string;
  role: string;
  fullName: string | null;
  email: string | null;
}

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const tenantId = useTenantStore((s) => s.tenantId);
  const setTenantId = useTenantStore((s) => s.setTenantId);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');

  const login = async () => {
    // Chưa có tenantId → bắt buộc quét QR trước khi đăng nhập
    if (!tenantId) {
      setError('Vui lòng quét mã QR bên dưới để đăng nhập.');
      return;
    }
    if (!userName.trim() || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { data: tokens } = await api.post<TokenPair>('/auth/login', { userName: userName.trim(), password });
      // /auth/me cần Bearer → lưu token trước
      await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      let me: MeResponse;
      try {
        me = (await api.get<MeResponse>('/auth/me')).data;
      } catch (e) {
        await tokenStorage.clear();
        throw e;
      }

      const role = mapRole(me.role);
      const user: AuthUser = {
        id: me.id,
        userName: me.userName,
        name: me.fullName ?? me.userName,
        email: me.email,
        role,
        apiRole: me.role,
        saleId: role === 'sale' ? me.id : undefined,
      };
      await signIn({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Đăng nhập thất bại. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  const onScanned = async (raw: string) => {
    const parsed = parseTenantQr(raw);
    if (!parsed) {
      setScanError('Mã QR không hợp lệ');
      return;
    }
    // Mỗi lần quét hợp lệ sẽ cập nhật lại tenantId
    await setTenantId(parsed.tenantId);
    setScanning(false);
    setScanError('');
    setError('');
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
          <Field label="Tên đăng nhập" value={userName} onChangeText={setUserName} placeholder="Nhập tên đăng nhập" />
          <Field label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Nhập mật khẩu" secureTextEntry />
          {error ? (
            <Txt size={12} color={C.red}>
              {error}
            </Txt>
          ) : null}
          <Btn label={loading ? 'Đang đăng nhập…' : 'Đăng nhập'} onPress={login} disabled={loading} style={{ marginTop: 6 }} />

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
