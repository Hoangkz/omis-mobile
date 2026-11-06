import { tenantStorage } from '@/src/lib/tenant-storage';
import { create } from 'zustand';

interface TenantState {
  tenantId: string | null;
  isLoaded: boolean;
  /** Khôi phục tenantId từ secure storage khi mở app */
  hydrate: () => Promise<void>;
  setTenantId: (tenantId: string) => Promise<void>;
  clearTenantId: () => Promise<void>;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: null,
  isLoaded: false,

  hydrate: async () => {
    // Ưu tiên tenant đã quét QR; chưa có thì lấy từ env (chỉ để test khi chưa có QR)
    const tenantId = (await tenantStorage.get()) || process.env.EXPO_PUBLIC_DEFAULT_TENANT_ID || null;
    set({ tenantId, isLoaded: true });
  },

  setTenantId: async (tenantId) => {
    await tenantStorage.set(tenantId);
    set({ tenantId });
  },

  clearTenantId: async () => {
    await tenantStorage.clear();
    set({ tenantId: null });
  },
}));
