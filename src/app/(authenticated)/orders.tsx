import {
  Order,
  OrderStatus,
  useCreateOrder,
  useOrders,
  useProducts,
  useSalesOptions,
} from '@/src/features/omis/api';
import { Badge, Btn, Card, Field, Picker, QueryState, Row, Screen, Sheet, Txt } from '@/src/features/omis/components';
import { C } from '@/src/features/omis/theme';
import { getApiErrorMessage } from '@/src/lib/api-error';
import { fmtNum, fmtVnd } from '@/src/lib/format';
import { MONTHS } from '@/src/lib/months';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { Plus, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

const dmy = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const STATUS: Record<OrderStatus, { label: string; tone: 'orange' | 'blue' | 'green' }> = {
  pending: { label: 'Chờ giao', tone: 'orange' },
  processing: { label: 'Đang giao', tone: 'blue' },
  completed: { label: 'Hoàn thành', tone: 'green' },
};

const sum = <T,>(list: T[], f: (x: T) => number) => list.reduce((s, x) => s + f(x), 0);

/** Trang 2 – Quản lý đặt hàng + tạo đơn hàng (Admin & Sale) */
export default function OrdersScreen() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const ordersQuery = useOrders();
  const productsQuery = useProducts();
  const salesQuery = useSalesOptions(isAdmin);
  const createOrder = useCreateOrder();

  const [q, setQ] = useState('');
  const [product, setProduct] = useState('all');
  const [month, setMonth] = useState('all');
  const [sale, setSale] = useState('all');
  const [creating, setCreating] = useState(false);

  // form tạo đơn
  const [fCustomer, setFCustomer] = useState('');
  const [fProduct, setFProduct] = useState('');
  const [fQty, setFQty] = useState('1');
  const [fSale, setFSale] = useState('none');
  const [formError, setFormError] = useState('');

  const products = productsQuery.data ?? [];
  const selectedProduct = products.find((p) => String(p.id) === fProduct);

  const visible = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return (ordersQuery.data ?? []).filter((o: Order) => {
      if (!isAdmin && o.salespersonId !== user?.id) return false; // Sale chỉ thấy đơn của mình
      if (isAdmin && sale !== 'all' && o.salespersonId !== sale) return false;
      if (product !== 'all' && !o.orderItems.some((i) => String(i.productId) === product)) return false;
      if (month !== 'all' && new Date(o.orderDate).getMonth() + 1 !== Number(month)) return false;
      if (kw && !(o.orderCode.toLowerCase().includes(kw) || (o.customerName ?? '').toLowerCase().includes(kw))) return false;
      return true;
    });
  }, [ordersQuery.data, q, product, month, sale, isAdmin, user?.id]);

  const totals = useMemo(() => {
    const items = visible.flatMap((o) => o.orderItems);
    return {
      qty: sum(items, (i) => i.quantity),
      delivered: sum(items, (i) => i.deliveredQuantity),
      remaining: sum(items, (i) => i.remainingQuantity),
      total: sum(visible, (o) => o.orderTotal ?? 0),
      paid: sum(visible, (o) => o.totalPaid ?? 0),
      debt: sum(visible, (o) => o.orderDebt ?? 0),
      // BE ẩn số tiền với một số vai trò (trả null)
      hasMoney: visible.length === 0 || visible.some((o) => o.orderTotal !== null),
    };
  }, [visible]);
  const money = (n: number) => (totals.hasMoney ? fmtVnd(n) : '—');

  const openCreate = () => {
    setFormError('');
    setFCustomer('');
    setFQty('1');
    setFSale('none');
    setFProduct(products[0] ? String(products[0].id) : '');
    setCreating(true);
  };

  const submit = async () => {
    const qty = parseInt(fQty, 10);
    if (!selectedProduct) return setFormError('Vui lòng chọn sản phẩm');
    if (!qty || qty <= 0) return setFormError('Số lượng phải lớn hơn 0');
    setFormError('');
    try {
      await createOrder.mutateAsync({
        customerName: fCustomer.trim() || undefined,
        // Sale: BE tự gán cho chính mình; Admin: chọn nhân viên (không bắt buộc)
        salespersonId: isAdmin ? (fSale === 'none' ? undefined : fSale) : user?.id,
        items: [
          {
            productId: selectedProduct.id,
            quantity: qty,
            unitPrice: selectedProduct.unitPrice ?? 0,
            vatRate: selectedProduct.vatRate ?? 0,
          },
        ],
      });
      setCreating(false);
    } catch (e) {
      setFormError(getApiErrorMessage(e));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title="Quản lý đặt hàng"
        subtitle={isAdmin ? 'Tất cả Sale' : `Đơn của ${user?.name}`}
        onRefresh={() => ordersQuery.refetch()}
        refreshing={ordersQuery.isRefetching}
      >
        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#fff',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: C.line,
              paddingHorizontal: 12,
              height: 44,
            }}
          >
            <Search size={18} color={C.sub} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Lọc tên khách hoặc mã đơn"
              placeholderTextColor="#9AA8C4"
              style={{ flex: 1, fontSize: 14, color: C.text }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Picker
              label="Sản phẩm"
              value={product}
              onChange={setProduct}
              options={[{ value: 'all', label: 'Tất cả sản phẩm' }, ...products.map((p) => ({ value: String(p.id), label: p.name }))]}
            />
            <Picker
              label="Ngày / Tháng"
              value={month}
              onChange={setMonth}
              options={[{ value: 'all', label: 'Tất cả' }, ...MONTHS.map((_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }))]}
            />
          </View>
          {isAdmin ? (
            <Picker
              full
              label="Nhân viên kinh doanh"
              value={sale}
              onChange={setSale}
              options={[
                { value: 'all', label: 'Tất cả Sale' },
                ...(salesQuery.data ?? []).map((s) => ({ value: s.id, label: s.fullName || s.userName })),
              ]}
            />
          ) : null}
        </View>

        <QueryState loading={ordersQuery.isLoading} error={ordersQuery.error} onRetry={() => ordersQuery.refetch()} />

        {ordersQuery.data ? (
          <>
            <Card>
              <Txt size={12} weight="700" color={C.sub} style={{ marginBottom: 4 }}>
                TỔNG HỢP · Đơn vị (VNĐ)
              </Txt>
              <Row label="Tổng đơn" value={fmtNum(visible.length)} />
              <Row label="Tổng số lượng" value={fmtNum(totals.qty)} />
              <Row label="Tổng đã giao" value={fmtNum(totals.delivered)} />
              <Row label="Còn lại" value={fmtNum(totals.remaining)} />
              <View style={{ height: 1, backgroundColor: C.line, marginVertical: 6 }} />
              <Row label="Tổng tiền / đơn hàng" value={money(totals.total)} bold />
              <Row label="Tổng thu" value={money(totals.paid)} />
              <Row label="Tổng nợ" value={money(totals.debt)} />
            </Card>

            {visible.length === 0 ? (
              <Txt color={C.sub} align="center" style={{ paddingVertical: 24 }}>
                Không có đơn hàng phù hợp
              </Txt>
            ) : (
              visible.map((o) => {
                const st = STATUS[o.status];
                const qty = sum(o.orderItems, (i) => i.quantity);
                const delivered = sum(o.orderItems, (i) => i.deliveredQuantity);
                return (
                  <Card key={o.id} style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Txt size={13} weight="800" color={C.primary}>
                        {o.orderCode}
                      </Txt>
                      <Badge label={st.label} tone={st.tone} />
                    </View>
                    <Txt size={15} weight="700">
                      {o.customerName || 'Khách lẻ'}
                    </Txt>
                    <Txt size={12} color={C.sub} numberOfLines={2}>
                      {o.orderItems.map((i) => `${i.productName ?? 'Sản phẩm'} × ${i.quantity}`).join(' · ')}
                    </Txt>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <Txt size={11} color={C.sub}>
                        {dmy(o.orderDate)} · {o.salespersonName ?? 'Chưa gán Sale'} · Giao {delivered}/{qty}
                      </Txt>
                      <Txt size={15} weight="800">
                        {o.orderTotal === null ? '—' : fmtVnd(o.orderTotal)}
                      </Txt>
                    </View>
                  </Card>
                );
              })
            )}
          </>
        ) : null}
      </Screen>

      <Pressable
        onPress={openCreate}
        style={{
          position: 'absolute',
          right: 18,
          bottom: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: C.primary,
          paddingHorizontal: 18,
          height: 50,
          borderRadius: 25,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Plus size={20} color="#fff" />
        <Txt size={14} weight="700" color="#fff">
          Tạo đơn hàng
        </Txt>
      </Pressable>

      <Sheet visible={creating} onClose={() => setCreating(false)} title="Tạo đơn hàng">
        <View style={{ gap: 12, paddingTop: 8 }}>
          <Field label="Khách hàng" value={fCustomer} onChangeText={setFCustomer} placeholder="Tên khách hàng" />
          <Picker
            full
            label="Sản phẩm"
            value={fProduct}
            onChange={setFProduct}
            options={products.map((p) => ({ value: String(p.id), label: `${p.name}${p.unitPrice ? ` – ${fmtNum(p.unitPrice)} ₫` : ''}` }))}
          />
          <Field label="Số lượng" value={fQty} onChangeText={setFQty} keyboardType="numeric" />
          {isAdmin ? (
            <Picker
              full
              label="Nhân viên kinh doanh"
              value={fSale}
              onChange={setFSale}
              options={[
                { value: 'none', label: 'Chưa gán' },
                ...(salesQuery.data ?? []).map((s) => ({ value: s.id, label: s.fullName || s.userName })),
              ]}
            />
          ) : null}
          <Row label="Thành tiền (chưa VAT)" value={fmtVnd((parseInt(fQty, 10) || 0) * (selectedProduct?.unitPrice ?? 0))} bold />
          {formError ? (
            <Txt size={12} color={C.red}>
              {formError}
            </Txt>
          ) : null}
          <Btn label={createOrder.isPending ? 'Đang tạo…' : 'Tạo đơn'} onPress={submit} disabled={createOrder.isPending} />
        </View>
      </Sheet>
    </View>
  );
}
