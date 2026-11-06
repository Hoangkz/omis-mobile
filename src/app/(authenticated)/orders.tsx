import { Badge, Btn, Card, Field, Picker, Row, Screen, Sheet, Txt } from '@/src/features/omis/components';
import { CUSTOMERS, MONTHS, Order, PRODUCTS, SALES } from '@/src/features/omis/mock-data';
import { useOmisStore } from '@/src/features/omis/store';
import { C } from '@/src/features/omis/theme';
import { fmtNum, fmtVnd } from '@/src/lib/format';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { Plus, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

const productOf = (code: string) => PRODUCTS.find((p) => p.code === code)!;
const saleName = (id: string) => SALES.find((s) => s.id === id)?.name ?? 'Ông chủ';
const dmy = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

const STATUS: Record<Order['status'], { label: string; tone: 'orange' | 'blue' | 'green' }> = {
  pending: { label: 'Chờ duyệt', tone: 'orange' },
  approved: { label: 'Đang giao', tone: 'blue' },
  delivered: { label: 'Hoàn thành', tone: 'green' },
};

/** Trang 2 – Quản lý đặt hàng + tạo đơn hàng (Admin & Sale) */
export default function OrdersScreen() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const orders = useOmisStore((s) => s.orders);
  const addOrder = useOmisStore((s) => s.addOrder);

  const [q, setQ] = useState('');
  const [product, setProduct] = useState('all');
  const [month, setMonth] = useState('all');
  const [sale, setSale] = useState('all');
  const [creating, setCreating] = useState(false);

  // form tạo đơn
  const [fCustomer, setFCustomer] = useState(CUSTOMERS[0]);
  const [fProduct, setFProduct] = useState(PRODUCTS[0].code);
  const [fQty, setFQty] = useState('10');

  const visible = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (!isAdmin && o.saleId !== user?.saleId) return false; // Sale chỉ thấy đơn của mình
      if (isAdmin && sale !== 'all' && o.saleId !== sale) return false;
      if (product !== 'all' && o.productCode !== product) return false;
      if (month !== 'all' && Number(o.date.slice(5, 7)) !== Number(month)) return false;
      if (kw && !(o.id.toLowerCase().includes(kw) || o.customer.toLowerCase().includes(kw))) return false;
      return true;
    });
  }, [orders, q, product, month, sale, isAdmin, user?.saleId]);

  const sum = useMemo(() => {
    const qty = visible.reduce((s, o) => s + o.qty, 0);
    const delivered = visible.reduce((s, o) => s + o.delivered, 0);
    const total = visible.reduce((s, o) => s + o.qty * productOf(o.productCode).price, 0);
    const paid = visible.reduce((s, o) => s + o.paid, 0);
    return { qty, delivered, total, paid, debt: total - paid, built: Math.round(qty * 0.8) };
  }, [visible]);

  const submit = () => {
    const qty = parseInt(fQty, 10);
    if (!qty || qty <= 0) return;
    addOrder({
      date: new Date().toISOString().slice(0, 10),
      customer: fCustomer,
      productCode: fProduct,
      qty,
      saleId: user?.saleId ?? 'admin',
    });
    setCreating(false);
    setFQty('10');
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen title="Quản lý đặt hàng" subtitle={isAdmin ? 'Tất cả Sale' : `Đơn của ${user?.name}`}>
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
              options={[{ value: 'all', label: 'Tất cả sản phẩm' }, ...PRODUCTS.map((p) => ({ value: p.code, label: p.name }))]}
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
              options={[{ value: 'all', label: 'Tất cả Sale' }, ...SALES.map((s) => ({ value: s.id, label: s.name }))]}
            />
          ) : null}
        </View>

        <Card>
          <Txt size={12} weight="700" color={C.sub} style={{ marginBottom: 4 }}>
            TỔNG HỢP · Đơn vị (VNĐ)
          </Txt>
          <Row label="Tổng đơn" value={fmtNum(visible.length)} />
          <Row label="Tổng số lượng" value={fmtNum(sum.qty)} />
          <Row label="Tổng bán thành phẩm (đã lắp)" value={fmtNum(sum.built)} />
          <Row label="Tổng đã giao" value={fmtNum(sum.delivered)} />
          <Row label="Còn lại" value={fmtNum(sum.qty - sum.delivered)} />
          <View style={{ height: 1, backgroundColor: C.line, marginVertical: 6 }} />
          <Row label="Tổng tiền / đơn hàng" value={fmtVnd(sum.total)} bold />
          <Row label="Tổng thu" value={fmtVnd(sum.paid)} />
          <Row label="Tổng nợ" value={fmtVnd(sum.debt)} />
        </Card>

        {visible.length === 0 ? (
          <Txt color={C.sub} align="center" style={{ paddingVertical: 24 }}>
            Không có đơn hàng phù hợp
          </Txt>
        ) : (
          visible.map((o) => {
            const p = productOf(o.productCode);
            const st = STATUS[o.status];
            return (
              <Card key={o.id} style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Txt size={13} weight="800" color={C.primary}>
                    {o.id}
                  </Txt>
                  <Badge label={st.label} tone={st.tone} />
                </View>
                <Txt size={15} weight="700">
                  {o.customer}
                </Txt>
                <Txt size={12} color={C.sub}>
                  {p.name} · SL {o.qty} × {fmtNum(p.price)} ₫
                </Txt>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Txt size={11} color={C.sub}>
                    {dmy(o.date)} · {saleName(o.saleId)} · Giao {o.delivered}/{o.qty}
                  </Txt>
                  <Txt size={15} weight="800">
                    {fmtVnd(o.qty * p.price)}
                  </Txt>
                </View>
              </Card>
            );
          })
        )}
      </Screen>

      <Pressable
        onPress={() => setCreating(true)}
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
          <Picker full label="Khách hàng" value={fCustomer} onChange={setFCustomer} options={CUSTOMERS.map((c) => ({ value: c, label: c }))} />
          <Picker full label="Sản phẩm" value={fProduct} onChange={setFProduct} options={PRODUCTS.map((p) => ({ value: p.code, label: `${p.name} – ${fmtNum(p.price)} ₫` }))} />
          <Field label="Số lượng" value={fQty} onChangeText={setFQty} keyboardType="numeric" />
          <Row label="Thành tiền" value={fmtVnd((parseInt(fQty, 10) || 0) * productOf(fProduct).price)} bold />
          <Btn label="Tạo đơn" onPress={submit} />
        </View>
      </Sheet>
    </View>
  );
}
