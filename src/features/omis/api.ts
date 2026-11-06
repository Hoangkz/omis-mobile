import api from '@/src/lib/api';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { useTenantStore } from '@/src/shared/store/use-tenant-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/* ------------------------------------------------------------------ */
/* Types (theo OpenAPI của BE: http://localhost:8080/api/docs)          */
/* ------------------------------------------------------------------ */

export type OrderStatus = 'pending' | 'processing' | 'completed';

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string | null;
  productCode: string | null;
  quantity: number;
  unitPrice: number | null;
  vatRate: number | null;
  lineTotalWithVat: number | null;
  deliveredQuantity: number;
  remainingQuantity: number;
}

export interface Order {
  id: number;
  orderCode: string;
  customerName: string | null;
  orderDate: string; // ISO
  salespersonId: string | null;
  salespersonName: string | null;
  orderItems: OrderItem[];
  orderTotal: number | null;
  totalPaid: number | null;
  orderDebt: number | null;
  status: OrderStatus;
}

export interface Product {
  id: number;
  name: string;
  code: string | null;
  unit: string | null;
  unitPrice: number | null;
  vatRate: number | null;
}

export interface SalesOption {
  id: string;
  fullName: string | null;
  userName: string;
}

export interface AppUser {
  id: string;
  userName: string;
  fullName: string | null;
  role: string;
}

export interface DashboardStats {
  productCount: number;
  componentCount: number;
  orderCount: number;
  pendingPurchaseRequests: number;
  totalOrderQty: number;
  deliveredQty: number;
  totalDebt: number;
}

export interface RevenueRow {
  month: number | 'Tổng';
  revenue: number;
  paid: number;
  debt: number;
}

export interface PrStatus {
  pending: number;
  approved: number;
  purchased: number;
  completed: number;
  rejected: number;
}

export interface SalesRevenue {
  ranking?: { id: string; fullName: string | null; userName: string; revenue: number }[];
  monthly?: { month: string; revenue: number }[];
  totalRevenue?: number;
}

export interface PurchaseRequestItem {
  componentCode: string;
  componentName: string | null;
  unit: string | null;
  quantity: number;
  unitPrice: number | null;
  vatRate: number | null;
  supplier: string;
}

export interface PurchaseRequest {
  id: number;
  requestCode: string;
  productName: string | null;
  status: string | null; // pending | approved | rejected | purchased | completed
  notes: string | null;
  createdBy: string | null;
  createdAt: string | null;
  items: PurchaseRequestItem[];
  supplier: string | null;
  rejectionReason: string | null;
}

export interface ChangeRequest {
  id: number;
  entity: string;
  entityId: string;
  entityLabel: string | null;
  payload: Record<string, unknown>;
  before: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'stale';
  reason: string | null;
  createdByName: string | null;
  createdByUserName: string | null;
  createdAt: string;
  decideNote: string | null;
}

export interface MonthlyExpenses {
  months: { month: number; incurred: number; committed: number; pending: number; total: number }[];
  byCategory: { name: string; amount: number; pct: number }[];
}

export interface CustomerGrossProfit {
  rows: { customerKey: string; customerName: string; revenue: number; cost: number; grossProfit: number; margin: number | null }[];
  hasMore: boolean;
  totals: { revenue: number; cost: number; grossProfit: number; margin: number | null }[] | { revenue: number; cost: number; grossProfit: number; margin: number | null };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/** Cache theo tenant + user để đổi tài khoản/doanh nghiệp không lẫn dữ liệu */
function useScope() {
  const tenantId = useTenantStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  return [tenantId, userId] as const;
}

const get = async <T,>(url: string, params?: Record<string, unknown>) => (await api.get<T>(url, { params })).data;

/**
 * Lấy danh sách từ response. Spec ghi là mảng, nhưng BE có thể bọc thêm một tầng
 * (vd { data: [...] }, { rows: [...] }) → tự tìm mảng bên trong, và cảnh báo để dễ chỉnh.
 */
export function asArray<T>(payload: unknown, url = ''): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    for (const key of ['data', 'items', 'rows', 'months', 'results', 'list']) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
    const anyArray = Object.values(obj).find(Array.isArray);
    if (anyArray) return anyArray as T[];
  }
  if (__DEV__) console.warn(`[api] ${url}: response không phải danh sách`, JSON.stringify(payload)?.slice(0, 300));
  return [];
}

const getList = async <T,>(url: string, params?: Record<string, unknown>) => asArray<T>(await get<unknown>(url, params), url);

/** Một số endpoint trả mảng 1 phần tử cho `totals`/`prStatus` – gom về object */
export const first = <T,>(v: T | T[] | undefined): T | undefined => (Array.isArray(v) ? v[0] : v);

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

export const useDashboardStats = () => {
  const scope = useScope();
  return useQuery({ queryKey: ['dashboard-stats', ...scope], queryFn: () => get<DashboardStats>('/dashboard/stats') });
};

export const useDashboardRevenue = (year: number) => {
  const scope = useScope();
  return useQuery({ queryKey: ['dashboard-revenue', year, ...scope], queryFn: () => getList<RevenueRow>('/dashboard/revenue', { year }) });
};

export const useDashboardCharts = () => {
  const scope = useScope();
  return useQuery({
    queryKey: ['dashboard-charts', ...scope],
    queryFn: () => get<{ prStatus: PrStatus | PrStatus[] }>('/dashboard/charts'),
  });
};

export const useProductOrderStatus = (year: number, month?: number) => {
  const scope = useScope();
  return useQuery({
    queryKey: ['product-order-status', year, month, ...scope],
    queryFn: () => get<{ totalOrderQty: number; deliveredQty: number }>('/dashboard/product-order-status', { year, month }),
  });
};

export const useSalesRevenue = (year: number, salespersonId?: string) => {
  const scope = useScope();
  return useQuery({
    queryKey: ['sales-revenue', year, salespersonId, ...scope],
    queryFn: () => get<SalesRevenue>('/dashboard/sales-revenue-overview', { year, salespersonId }),
  });
};

/* ------------------------------------------------------------------ */
/* Orders / products / users                                            */
/* ------------------------------------------------------------------ */

export const useOrders = () => {
  const scope = useScope();
  return useQuery({ queryKey: ['orders', ...scope], queryFn: () => getList<Order>('/orders') });
};

export const useProducts = () => {
  const scope = useScope();
  return useQuery({
    queryKey: ['products', ...scope],
    queryFn: () => getList<Product>('/products', { take: 200 }),
  });
};

export const useSalesOptions = (enabled = true) => {
  const scope = useScope();
  return useQuery({
    queryKey: ['sales-options', ...scope],
    queryFn: () => getList<SalesOption>('/users/sales-options'),
    enabled,
  });
};

export const useUsers = (enabled = true) => {
  const scope = useScope();
  return useQuery({ queryKey: ['users', ...scope], queryFn: () => getList<AppUser>('/users'), enabled });
};

export interface CreateOrderInput {
  customerName?: string;
  salespersonId?: string;
  items: { productId: number; quantity: number; unitPrice: number; vatRate?: number }[];
}

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => (await api.post<Order>('/orders', input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

/* ------------------------------------------------------------------ */
/* Phê duyệt                                                            */
/* ------------------------------------------------------------------ */

export const usePurchaseRequests = () => {
  const scope = useScope();
  return useQuery({ queryKey: ['purchase-requests', ...scope], queryFn: () => getList<PurchaseRequest>('/purchase-requests') });
};

export const useDecidePurchaseRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: number; decision: 'approved' | 'rejected'; rejectionReason?: string }) =>
      (await api.post(`/purchase-requests/${p.id}/decision`, { decision: p.decision, rejectionReason: p.rejectionReason || undefined })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-requests'] });
      qc.invalidateQueries({ queryKey: ['dashboard-charts'] });
    },
  });
};

export const useChangeRequests = () => {
  const scope = useScope();
  return useQuery({ queryKey: ['change-requests', ...scope], queryFn: () => getList<ChangeRequest>('/change-requests/pending') });
};

export const useDecideChangeRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: number; approve: boolean; note?: string }) =>
      (await api.post(`/change-requests/${p.id}/decide`, { approve: p.approve, note: p.note || undefined })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['change-requests'] }),
  });
};

/* ------------------------------------------------------------------ */
/* Chi phí / lợi nhuận                                                  */
/* ------------------------------------------------------------------ */

export const useMonthlyExpenses = (year: number) => {
  const scope = useScope();
  return useQuery({
    queryKey: ['monthly-expenses', year, ...scope],
    queryFn: () => get<MonthlyExpenses>('/revenue-cost/monthly-expenses', { year }),
  });
};

export const useCustomerGrossProfit = (year: number, month?: number) => {
  const scope = useScope();
  return useQuery({
    queryKey: ['customer-gross-profit', year, month, ...scope],
    queryFn: () => get<CustomerGrossProfit>('/revenue-cost/customer-gross-profit', { year, month }),
  });
};
