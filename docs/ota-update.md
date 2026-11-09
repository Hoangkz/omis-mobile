# Cập nhật OTA (Over-The-Air) cho OMIS Mobile

Tài liệu thiết kế cơ chế cập nhật ứng dụng **không cần phát hành lại lên App Store / CH Play**: phiên bản lưu trong DB, thông báo bản mới qua **push notification**, ứng dụng tự tải và áp dụng bundle JS mới bằng `expo-updates`.

---

## 1. Nguyên lý

- App gồm 2 phần:
  - **Khung native** (APK/IPA): `MainActivity`, Hermes, các thư viện native (camera, notifications, reanimated...). Chỉ thay đổi qua store.
  - **Bundle JS** (`index.android.bundle` / `main.jsbundle`): toàn bộ code trong `src/` — page, component, logic, style. Thay được qua OTA.
- `expo-updates` đảm nhận việc **tải và nạp** bundle mới. API version + push của BE chỉ quyết định **khi nào** và **cho ai** cập nhật.
- Push là **tín hiệu kích hoạt**, không đảm bảo 100% tới nơi → luôn có lớp dự phòng: kiểm tra khi mở app và khi app quay lại foreground.

### OTA được / không được

| Thay đổi | OTA |
|---|---|
| Thêm page, sửa UI, sửa logic, đổi API, thêm ảnh/font dùng trong JS | ✅ |
| Thêm thư viện native mới (vd. `expo-location`) | ❌ phải lên store |
| Sửa `app.json` phần native: quyền, icon, splash, tên app, package, plugin | ❌ phải lên store |
| Nâng cấp Expo SDK / React Native | ❌ phải lên store |

### Hai loại version

| Loại | Khi nào tăng | Ví dụ |
|---|---|---|
| **Version native** (`version` / `runtimeVersion`) | Chỉ khi thay đổi phần native → lên store | 1.0.0 → 2.0.0 |
| **Version JS** (`js_version`, hiển thị cho người dùng) | Mỗi lần OTA | 1.0.0 → 1.0.1 → 1.0.2 |

> ⚠️ Hiện `runtimeVersion.policy = "appVersion"`. Nếu tăng `version` lên 1.0.1 thì bản OTA sẽ có runtime 1.0.1 và **máy đang cài 1.0.0 sẽ không nhận**. Phải giữ `runtimeVersion` cố định (vd. `"1.0.0"`) hoặc chuyển sang policy `"fingerprint"`.

---

## 2. Kiến trúc tổng thể

```
┌──────────────┐  ① build bundle   ┌────────────────────────────────────────────┐
│  Dev / CI    │ ───────────────►  │                 BACKEND                    │
│ (expo export │  ② upload + ghi   │                                            │
│  + ký code)  │     metadata      │  ┌──────────────┐     ┌─────────────────┐  │
└──────────────┘                   │  │ Admin API    │────►│       DB        │  │
                                   │  │ publish /    │     │ app_updates     │  │
                                   │  │ rollback     │     │ devices         │  │
                                   │  └──────┬───────┘     └───────▲─────────┘  │
                                   │         │ ③ trigger           │            │
                                   │  ┌──────▼───────┐     ┌───────┴─────────┐  │
                                   │  │ Push Worker  │     │ Version API     │  │
                                   │  │ (theo đợt)   │     │ Manifest API    │  │
                                   │  │              │     │ Device API      │  │
                                   │  └──────┬───────┘     └───────▲─────────┘  │
                                   └─────────┼─────────────────────┼────────────┘
                                             │                     │
                               ④ data push   │                     │ ⑤ check / manifest
                                             ▼                     │
┌──────────────┐               ┌──────────────────┐                │
│ Object       │  ⑥ tải bundle │   Expo Push /    │                │
│ Storage + CDN│ ◄──────┐      │   FCM / APNs     │                │
│ (bundle,     │        │      └────────┬─────────┘                │
│  assets)     │        │               ▼                          │
└──────────────┘        │      ┌───────────────────────────────────┴──┐
                        └──────┤          APP (khung 1.0.0)           │
                               │  expo-updates  · expo-notifications  │
                               │  expo-task-manager · UpdateManager   │
                               └──────────────────────────────────────┘
```

### Các thành phần BE

| Thành phần | Vai trò |
|---|---|
| **Device API** | App gửi lên `device_id`, `push_token`, `platform`, `channel`, `runtime_version`, `js_version` |
| **Version API** | Trả về bản mới nhất: `js_version`, `mandatory`, `changelog` |
| **Manifest API** | Endpoint theo [Expo Updates protocol](https://docs.expo.dev/technical-specs/expo-updates-1/) — là `updates.url` của app; đọc bản `active` trong DB, trả manifest + link bundle trên CDN |
| **Admin API** | Upload bundle, publish, rollback, chỉnh rollout % |
| **Push Worker** | Lọc thiết bị cần cập nhật, gửi data push theo đợt, xóa token chết |
| **Object Storage + CDN** | Lưu file bundle và assets. **Không** lưu file trong DB |

---

## 3. Dữ liệu trong DB

```
app_updates                               devices
──────────────────────────────            ──────────────────────────────
id              (uuid)                    id              (uuid)
platform        android | ios             device_id       (unique)
channel         production | staging      user_id         (nullable)
runtime_version 1.0.0                     platform
js_version      1.0.1   ← hiển thị        channel
bundle_url      (CDN)                     runtime_version
manifest_json   (assets, hash)            js_version      ← bản đang chạy
signature                                 push_token
mandatory       bool                      push_enabled    bool
rollout_percent 0..100                    last_seen_at
status          draft|active|rolled_back
changelog
created_at
```

**Quy tắc:** mỗi bộ `(platform, channel, runtime_version)` chỉ có **1** bản ghi `active`.

---

## 4. Luồng publish (phía BE)

```
 Dev                      Admin API                  Storage/CDN    DB               Push Worker
  │ build + ký bundle         │                          │           │                    │
  │── upload ────────────────►│── lưu file ─────────────►│           │                    │
  │                           │── insert (draft) ────────────────────►│                    │
  │── "publish" ─────────────►│── bản active cũ → inactive, ─────────►│                    │
  │                           │   bản mới → active                   │                    │
  │                           │── trigger ───────────────────────────────────────────────►│
  │                           │                          │           │◄─ query devices ───│
  │                           │                          │           │   khớp platform,   │
  │                           │                          │           │   runtime, channel │
  │                           │                          │           │   & js_version cũ  │
  │                           │                          │           │   & trong rollout% │
  │                           │                          │           │                    │── gửi theo đợt
  │                           │                          │           │                    │   (100 token/req,
  │                           │                          │           │                    │    giãn thời gian)
```

**Rollback:** đặt bản lỗi → `rolled_back`, bản trước → `active`, rồi trigger push lại.

**Rollout %:** thiết bị nằm trong rollout nếu `hash(device_id) % 100 < rollout_percent` — áp dụng nhất quán cho cả Push Worker và Version/Manifest API.

### Payload push (data-only, không hiển thị)

```json
{
  "type": "update_available",
  "js_version": "1.0.1",
  "mandatory": false
}
```

Với bản `mandatory`, có thể gửi thêm 1 thông báo hiển thị ("Có bản cập nhật quan trọng") — nhấn vào sẽ mở app và kích hoạt kiểm tra.

---

## 5. Luồng phía app

Ba điểm kích hoạt, cùng đi vào một hàm `checkUpdate()`:

```
   [App khởi động]     [AppState → active]     [Nhận data push "update_available"]
          │                    │                    │                     │
          │                    │              app đang mở           app chạy nền
          │                    │                    │              (background task)
          └────────────┬───────┴────────────────────┘                     │
                       ▼                                                  ▼
              ┌──────────────────┐                              ┌──────────────────┐
              │  checkUpdate()   │                              │ fetch bundle     │
              │  (có chống gọi   │                              │ ngầm, KHÔNG      │
              │   trùng)         │                              │ reload           │
              └────────┬─────────┘                              └────────┬─────────┘
                       ▼                                                  │
           gọi Version API (platform, channel,                lần mở app sau sẽ chạy
           runtime, js_version, device_id)                    bản đã tải (expo-updates
                       │                                       tự áp dụng)
              ┌────────┴────────┐
          không có          có bản mới
              │                 ▼
            (hết)      expo-updates: check → fetch
                                │
                       ┌────────┴─────────┐
                  tải lỗi              tải xong
                       │                  ▼
              thử lại lần sau      ┌──────────────┐
                                   │ mandatory ?  │
                                   └──┬────────┬──┘
                                    có        không
                                     ▼          ▼
                          màn hình chặn    ┌─────────────────────┐
                          "Đang cập nhật"  │ đang nhập liệu /    │
                                 │         │ màn hình quan trọng?│
                                 ▼         └──┬───────────────┬──┘
                            reloadAsync()    có              không
                                              ▼               ▼
                                     áp dụng lần mở sau  toast "Có bản mới
                                                         – Khởi động lại?"
                                                               │
                                                     đồng ý → reloadAsync()
```

Sau khi reload, app chạy bản mới và gửi `js_version` mới lên **Device API**, nhờ đó Push Worker không gửi push cho máy này nữa.

---

## 6. Lưu ý

### Push: Android và iOS khác nhau

| | Android (FCM) | iOS (APNs) |
|---|---|---|
| Data push khi app chạy nền | Khá ổn định nếu gửi priority high | **Không đảm bảo** — iOS giới hạn tần suất, có thể hoãn/bỏ |
| Người dùng đã vuốt tắt app | Thường vẫn nhận | **Không nhận** push im lặng |
| Thời gian chạy nền | Vài giây – vài chục giây | ~30 giây |

→ Tải ngầm khi app chạy nền chỉ là phần thêm; cái chắc chắn là kiểm tra khi mở app / quay lại foreground.

### Expo Push hay FCM trực tiếp

- **Expo Push Service**: một API cho cả Android và iOS, tối đa 100 thông báo/request, không có topic. Đủ cho quy mô vừa và nhỏ.
- **FCM trực tiếp** (`@react-native-firebase/messaging`): hỗ trợ **topic** (vd. `update-android-1.0.0-production`) → BE gửi 1 tin cho cả topic. Đổi lại phải tích hợp Firebase.

### Khác

- **Người dùng tắt quyền thông báo**: Android data push thường vẫn tới; iOS không chắc → thêm lý do giữ kiểm tra khi mở app / foreground.
- **Bão tải**: gửi push theo đợt, client chờ ngẫu nhiên trước khi tải; bundle phải nằm trên CDN.
- **Không reload khi người dùng đang thao tác** (đang nhập form) — tải ngầm, áp dụng lần mở sau hoặc hỏi người dùng.
- **Bảo mật**: HTTPS + **code signing** bundle để app từ chối bundle không do mình ký.
- **Token chết**: xóa khi Expo/FCM trả `DeviceNotRegistered`.
- **Bundle nhúng sẵn trong APK**: luôn giữ để app chạy được khi lần đầu mở không có mạng.
- **Chính sách store**: OTA để sửa lỗi / thêm tính năng là được phép, miễn không biến app thành app khác với lúc được duyệt.

---

## 7. Thứ tự triển khai

```
GIAI ĐOẠN 1 — Native (bắt buộc có trước khi lên store 1.0.0)
  ├─ cấu hình expo-updates: updates.url → Manifest API, checkAutomatically: NEVER
  ├─ runtimeVersion: giữ "1.0.0" cố định (hoặc dùng policy fingerprint)
  ├─ bật code signing (tạo cặp khóa, gắn public key vào app)
  ├─ cài expo-task-manager, iOS background mode remote-notification
  ├─ Android: google-services.json (FCM) · iOS: APNs key
  └─ build → lên store

GIAI ĐOẠN 2 — Backend
  ├─ bảng app_updates, devices
  ├─ Device API     (đăng ký/cập nhật token + version)
  ├─ Version API    (trả latest, mandatory, changelog)
  ├─ Manifest API   (theo Expo Updates protocol, đọc bản active)
  ├─ Admin API      (upload, publish, rollback, rollout %)
  └─ Push Worker    (lọc device, gửi theo đợt, xóa token chết)

GIAI ĐOẠN 3 — App (phần JS, OTA được)
  ├─ đăng ký push token → gửi lên Device API
  ├─ UpdateManager: checkUpdate() + 3 điểm kích hoạt
  ├─ UI: màn chặn (mandatory), toast hỏi khởi động lại
  └─ hiển thị js_version trong màn Cài đặt

GIAI ĐOẠN 4 — Quy trình phát hành
  ├─ script CI: export bundle → ký → upload → tạo bản draft
  ├─ publish vào channel staging → test → publish production
  └─ theo dõi: tỉ lệ máy đã lên bản mới (devices.js_version), crash → rollback
```

> **Quan trọng nhất:** Giai đoạn 1 phải hoàn tất **trước** khi đưa bản 1.0.0 lên store. Các phần native này không thể bổ sung sau bằng OTA. Giai đoạn 2–4 có thể làm sau.
