/** Vai trò trong app: Admin (Ông chủ) hoặc Sale */
export type Role = 'admin' | 'sale';

/** Role của BE (`/auth/me`) → vai trò trong app. Chỉ `sales` là Sale, còn lại xem như quản lý. */
export function mapRole(apiRole: string): Role {
  return apiRole === 'sales' ? 'sale' : 'admin';
}
