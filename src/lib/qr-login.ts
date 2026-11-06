/**
 * Đọc token đăng nhập nhanh từ nội dung mã QR (do BE tạo, sống 15 phút, dùng 1 lần). Chấp nhận:
 *  - Chuỗi thuần:      "<token>"
 *  - JSON:             {"token":"<token>"}
 *  - URL / deep link:  omis://login?token=<token>
 */
export function parseLoginQr(raw: string): { token: string } | null {
  const text = raw.trim();
  if (!text) return null;

  if (text.startsWith('{')) {
    try {
      const obj = JSON.parse(text) as Record<string, unknown>;
      const t = obj.token ?? obj.loginToken;
      return typeof t === 'string' && t.trim() ? { token: t.trim() } : null;
    } catch {
      return null;
    }
  }

  const query = text.match(/[?&](?:token|loginToken)=([^&#]+)/i);
  if (query) return { token: decodeURIComponent(query[1]) };

  // Chuỗi thuần: token không chứa khoảng trắng
  if (/^\S{16,}$/.test(text) && !/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) return { token: text };
  return null;
}

/** Lấy tenantId từ payload JWT (nếu BE nhúng vào token) — không xác thực chữ ký, chỉ để đọc. */
export function tenantFromJwt(jwt: string): string | null {
  try {
    const part = jwt.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=')));
    const id = json.tenantId ?? json.tenant_id ?? json.tenant;
    return typeof id === 'string' && id ? id : null;
  } catch {
    return null;
  }
}
