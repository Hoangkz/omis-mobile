import * as SecureStore from 'expo-secure-store';

const TENANT_ID_KEY = 'tenant_id';

export const tenantStorage = {
  get: () => SecureStore.getItemAsync(TENANT_ID_KEY),
  set: (tenantId: string) => SecureStore.setItemAsync(TENANT_ID_KEY, tenantId),
  clear: () => SecureStore.deleteItemAsync(TENANT_ID_KEY),
};

/**
 * Đọc tenantId từ nội dung mã QR. Chấp nhận:
 *  - Chuỗi thuần:            "acme-corp"
 *  - JSON:                   {"tenantId":"acme-corp","role":"admin"}
 *  - URL / deep link:        omis://login?tenantId=acme-corp  (hoặc ?tenant=...)
 */
export function parseTenantQr(raw: string): { tenantId: string; role?: 'admin' | 'sale' } | null {
  const text = raw.trim();
  if (!text) return null;

  const pickRole = (r: unknown) => (r === 'admin' || r === 'sale' ? r : undefined);

  if (text.startsWith('{')) {
    try {
      const obj = JSON.parse(text) as Record<string, unknown>;
      const id = obj.tenantId ?? obj.tenant_id ?? obj.tenant;
      if (typeof id === 'string' && id.trim()) return { tenantId: id.trim(), role: pickRole(obj.role) };
    } catch {
      return null;
    }
    return null;
  }

  const query = text.match(/[?&](?:tenantId|tenant_id|tenant)=([^&#]+)/i);
  if (query) {
    const role = text.match(/[?&]role=([^&#]+)/i)?.[1];
    return { tenantId: decodeURIComponent(query[1]), role: pickRole(role) };
  }

  // Chuỗi thuần: chỉ nhận ký tự hợp lệ cho một id
  if (/^[\w.-]{2,64}$/.test(text)) return { tenantId: text };
  return null;
}
