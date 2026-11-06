import { Card, CardTitle, ColumnChart, Donut, HBars, KpiTile, Legend, Picker, Screen, Sheet, Txt } from '@/src/features/omis/components';
import { COMPANY_MONTHLY, CUSTOMERS, MONTHS, PRODUCTS, SALES } from '@/src/features/omis/mock-data';
import { useOmisStore } from '@/src/features/omis/store';
import { C, SALE_COLORS } from '@/src/features/omis/theme';
import { fmtNum, fmtShort } from '@/src/lib/format';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, Package, ShoppingCart, Wrench } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

const YEAR_OPTIONS = [{ value: '2026', label: 'Năm 2026' }];
const MONTH_OPTIONS = [{ value: 'all', label: 'Cả năm' }, ...MONTHS.map((m, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }))];

/** Trang 3 – Báo cáo tổng quan (Admin) */
export default function HomeScreen() {
  const router = useRouter();
  const orders = useOmisStore((s) => s.orders);
  const requests = useOmisStore((s) => s.requests);
  const [month, setMonth] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<null | 'month' | 'customer'>(null);

  const filtered = useMemo(
    () => (month === 'all' ? orders : orders.filter((o) => Number(o.date.slice(5, 7)) === Number(month))),
    [orders, month],
  );

  const totals = useMemo(() => {
    const price = (code: string) => PRODUCTS.find((p) => p.code === code)?.price ?? 0;
    const qty = filtered.reduce((s, o) => s + o.qty, 0);
    const delivered = filtered.reduce((s, o) => s + o.delivered, 0);
    const revenue = filtered.reduce((s, o) => s + o.qty * price(o.productCode), 0);
    const paid = filtered.reduce((s, o) => s + o.paid, 0);
    return { qty, delivered, left: qty - delivered, revenue, paid, debt: revenue - paid };
  }, [filtered]);

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((o) => map.set(o.date.slice(0, 7), (map.get(o.date.slice(0, 7)) ?? 0) + 1));
    return [...map.entries()].sort();
  }, [filtered]);
  const byCustomer = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((o) => map.set(o.customer, (map.get(o.customer) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const statusCounts = [
    { label: 'Chờ duyệt', value: requests.filter((r) => r.status === 'pending').length, color: C.orange },
    { label: 'Đã duyệt', value: requests.filter((r) => r.status === 'approved').length, color: C.blue },
    { label: 'Từ chối', value: requests.filter((r) => r.status === 'rejected').length, color: C.red },
    { label: 'Đã mua', value: 2, color: C.teal },
    { label: 'Hoàn thành', value: 5, color: C.green },
  ];

  const saleTotals = SALES.map((s, i) => ({ label: s.name, value: s.monthly.reduce((a, b) => a + b, 0), color: SALE_COLORS[i] }));
  const sumRevenue = COMPANY_MONTHLY.reduce((s, m) => s + m.revenue, 0);
  const sumDebt = COMPANY_MONTHLY.reduce((s, m) => s + m.debt, 0);
  const paidPct = Math.round(((sumRevenue - sumDebt) / sumRevenue) * 100);

  return (
    <Screen
      title="Tổng quan"
      subtitle="Omis – Trợ lý Ông chủ"
    >
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Picker label="Năm" value="2026" options={YEAR_OPTIONS} onChange={() => {}} />
        <Picker label="Tháng" value={month} options={MONTH_OPTIONS} onChange={setMonth} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <KpiTile label="Sản phẩm" value="13" icon={<Package size={16} color={C.primary} />} />
        <KpiTile label="Linh kiện" value="213" icon={<Wrench size={16} color={C.teal} />} tint={C.teal} soft={C.greenSoft} />
        <KpiTile label="Đơn hàng" value={String(filtered.length)} icon={<ShoppingCart size={16} color={C.orange} />} tint={C.orange} soft={C.orangeSoft} />
      </View>

      <Card>
        <CardTitle>Doanh thu / Nợ – 2026</CardTitle>
        <ColumnChart
          height={140}
          colors={[C.blue, C.green, C.red]}
          groups={COMPANY_MONTHLY.slice(0, 10).map((m, i) => ({ label: MONTHS[i], values: [m.revenue, m.paid, m.debt] }))}
        />
        <Legend
          items={[
            { label: 'Tổng doanh thu', color: C.blue },
            { label: 'Đã thanh toán', color: C.green },
            { label: 'Nợ phải thu', color: C.red },
          ]}
        />
      </Card>

      <Card>
        <CardTitle>Tổng năm 2026 – % Thanh toán / Nợ</CardTitle>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
          <Donut
            parts={[
              { value: sumRevenue - sumDebt, color: C.green },
              { value: sumDebt, color: C.red },
            ]}
            centerTop={`${paidPct}%`}
            centerBottom="đã thu"
          />
          <View style={{ gap: 14 }}>
            <View>
              <Txt size={11} color={C.sub}>
                Đã thanh toán
              </Txt>
              <Txt size={18} weight="800" color={C.green}>
                {fmtShort(sumRevenue - sumDebt)}
              </Txt>
            </View>
            <View>
              <Txt size={11} color={C.sub}>
                Nợ phải thu
              </Txt>
              <Txt size={18} weight="800" color={C.red}>
                {fmtShort(sumDebt)}
              </Txt>
            </View>
          </View>
        </View>
      </Card>

      <Card>
        <CardTitle>Sản phẩm theo đơn</CardTitle>
        <ColumnChart
          height={130}
          colors={[C.blue, C.green, C.red]}
          format={fmtNum}
          groups={[
            { label: 'Tổng đơn', values: [totals.qty] },
            { label: 'Đã giao', values: [totals.delivered] },
            { label: 'Còn lại', values: [totals.left] },
          ]}
          onPressGroup={() => setDetail('month')}
        />
        <Txt size={11} color={C.sub} style={{ marginTop: 10 }}>
          Bấm vào biểu đồ để xem Đơn/Tháng và Đơn/Khách hàng
        </Txt>
      </Card>

      <Card>
        <CardTitle>Trạng thái yêu cầu đặt hàng</CardTitle>
        <ColumnChart height={110} colors={[C.blue]} format={fmtNum} groups={statusCounts.map((s) => ({ label: s.label, values: [s.value] }))} />
        {pendingCount > 0 ? (
          <Pressable onPress={() => router.push('/approvals')} style={{ marginTop: 10 }}>
            <Txt size={12} weight="700" color={C.primary}>
              {pendingCount} yêu cầu đang chờ bạn duyệt →
            </Txt>
          </Pressable>
        ) : null}
      </Card>

      <Card>
        <CardTitle
          right={
            <Pressable onPress={() => router.push('/revenue')}>
              <Txt size={12} weight="700" color={C.primary}>
                Chi tiết
              </Txt>
            </Pressable>
          }
        >
          Doanh thu từng Sale
        </CardTitle>
        <HBars rows={saleTotals} />
      </Card>

      <Pressable onPress={() => setExpanded((v) => !v)}>
        <Card style={{ backgroundColor: C.primarySoft }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt size={15} weight="800" color={C.primary}>
              MỞ RỘNG
            </Txt>
            {expanded ? <ChevronUp size={20} color={C.primary} /> : <ChevronDown size={20} color={C.primary} />}
          </View>
          {expanded ? (
            <View style={{ marginTop: 12, gap: 8 }}>
              <Txt size={12} weight="700" color={C.sub}>
                TOP KHÁCH HÀNG THEO SỐ ĐƠN
              </Txt>
              {byCustomer.slice(0, 5).map(([name, n]) => (
                <View key={name} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Txt size={13}>{name}</Txt>
                  <Txt size={13} weight="700">
                    {n} đơn
                  </Txt>
                </View>
              ))}
              <Txt size={11} color={C.sub} style={{ marginTop: 4 }}>
                Tổng tiền: {fmtShort(totals.revenue)} · Đã thu: {fmtShort(totals.paid)} · Còn nợ: {fmtShort(totals.debt)}
              </Txt>
            </View>
          ) : null}
        </Card>
      </Pressable>

      <Sheet visible={detail !== null} onClose={() => setDetail(null)} title={detail === 'month' ? 'Đơn / Tháng' : 'Đơn / Khách hàng'}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {(['month', 'customer'] as const).map((k) => (
            <Pressable
              key={k}
              onPress={() => setDetail(k)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: detail === k ? C.primary : C.primarySoft }}
            >
              <Txt size={12} weight="700" color={detail === k ? '#fff' : C.primary}>
                {k === 'month' ? 'Đơn / Tháng' : 'Đơn / Khách hàng'}
              </Txt>
            </Pressable>
          ))}
        </View>
        <HBars
          format={(n) => `${n} đơn`}
          rows={
            detail === 'month'
              ? byMonth.map(([ym, n]) => ({ label: `Tháng ${Number(ym.slice(5))}/${ym.slice(0, 4)}`, value: n, color: C.blue }))
              : byCustomer.map(([name, n]) => ({ label: name, value: n, color: C.teal }))
          }
        />
        {CUSTOMERS.length === 0 ? null : <View style={{ height: 8 }} />}
      </Sheet>
    </Screen>
  );
}
