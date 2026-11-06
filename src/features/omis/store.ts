import { create } from 'zustand';
import { ApprovalRequest, Order, SEED_ORDERS, SEED_REQUESTS } from './mock-data';

interface OmisState {
  orders: Order[];
  requests: ApprovalRequest[];
  addOrder: (o: Omit<Order, 'id' | 'delivered' | 'paid' | 'status'>) => void;
  decideRequest: (id: string, status: 'approved' | 'rejected', feedback: string) => void;
}

export const useOmisStore = create<OmisState>((set) => ({
  orders: SEED_ORDERS,
  requests: SEED_REQUESTS,

  addOrder: (o) =>
    set((s) => ({
      orders: [
        {
          ...o,
          id: `DH-${o.date.replace(/-/g, '')}-${String(s.orders.length + 1).padStart(3, '0')}`,
          delivered: 0,
          paid: 0,
          status: 'pending',
        },
        ...s.orders,
      ],
    })),

  decideRequest: (id, status, feedback) =>
    set((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, status, feedback } : r)),
    })),
}));
