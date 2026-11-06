import { C } from '@/src/features/omis/theme';
import { Txt } from '@/src/features/omis/components';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { Redirect } from 'expo-router';
import { Factory } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

/** Trang 1 – Splash "Omis – Phần mềm trợ lý bán hàng", sau đó điều hướng theo quyền */
export default function Index() {
  const user = useAuthStore((s) => s.user);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1400);
    return () => clearTimeout(t);
  }, []);

  if (done) {
    if (!isSignedIn) return <Redirect href="/login" />;
    return <Redirect href={user?.role === 'sale' ? '/orders' : '/home'} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <View
        style={{
          width: 112,
          height: 112,
          borderRadius: 30,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Factory size={56} color={C.primary} strokeWidth={1.8} />
      </View>
      <Txt size={40} weight="800" color="#fff">
        Omis
      </Txt>
      <Txt size={13} weight="600" color="#BFD0FA" style={{ letterSpacing: 1.5 }}>
        PHẦN MỀM TRỢ LÝ BÁN HÀNG
      </Txt>
      <View style={{ position: 'absolute', bottom: 40 }}>
        <Txt size={12} color="#9DB6F5">
          Copyright @ 2026 SENKI.JSC
        </Txt>
      </View>
    </View>
  );
}
