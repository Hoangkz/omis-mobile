import { CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Txt } from './components';
import { C } from './theme';

/** Màn hình quét mã QR (toàn màn hình). Gọi onScanned đúng 1 lần cho mỗi lần mở. */
export function QrScannerModal({
  visible,
  onClose,
  onScanned,
  error,
}: {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: string) => void;
  /** Lỗi từ lần quét trước (VD: QR không hợp lệ) */
  error?: string;
}) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false);
  const [busyUntil, setBusyUntil] = useState(0);

  useEffect(() => {
    if (visible) handled.current = false;
  }, [visible]);

  useEffect(() => {
    if (visible && permission && !permission.granted && permission.canAskAgain) requestPermission();
  }, [visible, permission, requestPermission]);

  const handle = ({ data }: { data: string }) => {
    if (handled.current || Date.now() < busyUntil) return;
    handled.current = true;
    onScanned(data);
    // cho phép quét lại sau 1.5s nếu màn hình vẫn mở (QR sai)
    setBusyUntil(Date.now() + 1500);
    setTimeout(() => {
      handled.current = false;
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {permission?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handle}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
            <Txt color="#fff" align="center" size={15}>
              Cần quyền truy cập camera để quét mã QR.
            </Txt>
            {permission?.canAskAgain === false ? (
              <Txt color="#9DB6F5" align="center" size={12}>
                Hãy bật quyền Camera cho OMIS trong Cài đặt của điện thoại.
              </Txt>
            ) : (
              <Btn label="Cấp quyền camera" onPress={requestPermission} />
            )}
          </View>
        )}

        {/* Khung ngắm */}
        {permission?.granted ? (
          <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 240, height: 240, borderRadius: 24, borderWidth: 3, borderColor: '#fff' }} />
          </View>
        ) : null}

        <View style={{ position: 'absolute', top: insets.top + 12, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt size={18} weight="800" color="#fff">
            Quét mã QR
          </Txt>
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={28} color="#fff" />
          </Pressable>
        </View>

        <View style={{ position: 'absolute', bottom: insets.bottom + 32, left: 24, right: 24, alignItems: 'center', gap: 8 }}>
          {error ? (
            <View style={{ backgroundColor: C.red, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}>
              <Txt size={13} weight="600" color="#fff" align="center">
                {error}
              </Txt>
            </View>
          ) : null}
          <Txt size={13} color="#fff" align="center">
            Đưa mã QR của doanh nghiệp vào khung để đăng nhập nhanh
          </Txt>
        </View>
      </View>
    </Modal>
  );
}
