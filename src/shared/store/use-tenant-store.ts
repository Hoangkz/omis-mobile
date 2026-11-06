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
    const tenantId = await tenantStorage.get();
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
