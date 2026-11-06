import {
  Card,
  CardTitle,
  ColumnChart,
  Donut,
  HBars,
  KpiTile,
  Legend,
  Picker,
  QueryState,
  Screen,
  Sheet,
  Txt,
} from '@/src/features/omis/components';
import {
  first,
  useDashboardCharts,
  useDashboardRevenue,
  useDashboardStats,
  useOrders,
  useProductOrderStatus,
  useSalesRevenue,
} from '@/src/features/omis/api';
import { C, SALE_COLORS } from '@/src/features/omis/theme';
import { fmtNum, fmtShort } from '@/src/lib/format';
import { MONTHS } from '@/src/lib/months';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, Package, ShoppingCart, Wrench } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

const THIS_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2].map((y) => ({ value: String(y), label: `Năm ${y}` }));
const MONTH_OPTIONS = [{ value: 'all', label: 'Cả năm' }, ...MONTHS.map((_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }))];

/** Trang 3 – Báo cáo tổng quan (Admin) */
export default function HomeScreen() {
  const router = useRouter();
  const [year, setYear] = useState(String(THIS_YEAR));
  const [month, setMonth] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<null | 'month' | 'customer'>(null);

  const y = Number(year);
  const m = month === 'all' ? undefined : Number(month);

  const stats = useDashboardStats();
  const revenue = useDashboardRevenue(y);
  const charts = useDashboardCharts();
  const orderStatus = useProductOrderStatus(y, m);
  const salesRevenue = useSalesRevenue(y);
  const orders = useOrders();

  const refetchAll = () => {
    stats.refetch();
    revenue.refetch();
    charts.refetch();
    orderStatus.refetch();
    salesRevenue.refetch();
    orders.refetch();
  };
  const refreshing = stats.isRefetching || revenue.isRefetching || orders.isRefetching;

  // Doanh thu theo tháng (bỏ dòng "Tổng") + tổng cả năm
  const monthRows = useMemo(() => (revenue.data ?? []).filter((r) => typeof r.month === 'number'), [revenue.data]);
  const totalRow = useMemo(() => (revenue.data ?? []).find((r) => r.month === 'Tổng'), [revenue.data]);
  const sumRevenue = totalRow?.revenue ?? monthRows.reduce((s, r) => s + r.revenue, 0);
  const sumPaid = totalRow?.paid ?? monthRows.reduce((s, r) => s + r.paid, 0);
  const sumDebt = totalRow?.debt ?? monthRows.reduce((s, r) => s + r.debt, 0);
  const paidPct = sumRevenue ? Math.round((sumPaid / sumRevenue) * 100) : 0;

  const pr = first(charts.data?.prStatus);
  const statusCounts = [
    { label: 'Chờ duyệt', value: pr?.pending ?? 0 },
    { label: 'Đã duyệt', value: pr?.approved ?? 0 },
    { label: 'Từ chối', value: pr?.rejected ?? 0 },
    { label: 'Đã mua', value: pr?.purchased ?? 0 },
    { label: 'Hoàn thành', value: pr?.completed ?? 0 },
  ];

  // Đơn / tháng và đơn / khách hàng (từ danh sách đơn của năm/tháng đang chọn)
  const filteredOrders = useMemo(
    () =>
      (orders.data ?? []).filter((o) => {
        const d = new Date(o.orderDate);
        return d.getFullYear() === y && (m === undefined || d.getMonth() + 1 === m);
      }),
    [orders.data, y, m],
  );
  const byMonth = useMemo(() => {
    const map = new Map<number, number>();
    filteredOrders.forEach((o) => {
      const mm = new Date(o.orderDate).getMonth() + 1;
      map.set(mm, (map.get(mm) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [filteredOrders]);
  const byCustomer = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach((o) => {
      const name = o.customerName || 'Khách lẻ';
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [filteredOrders]);

  const totalQty = orderStatus.data?.totalOrderQty ?? 0;
  const deliveredQty = orderStatus.data?.deliveredQty ?? 0;

  const saleRows = (salesRevenue.data?.ranking ?? []).map((s, i) => ({
    label: s.fullName || s.userName,
    value: s.revenue,
    color: SALE_COLORS[i % SALE_COLORS.length],
  }));

  const pending = pr?.pending ?? 0;

  return (
    <Screen title="Tổng quan" subtitle="Omis – Trợ lý Ông chủ" onRefresh={refetchAll} refreshing={refreshing}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Picker label="Năm" value={year} options={YEAR_OPTIONS} onChange={setYear} />
        <Picker label="Tháng" value={month} options={MONTH_OPTIONS} onChange={setMonth} />
      </View>

      <QueryState
        loading={stats.isLoading}
        error={stats.error ?? revenue.error ?? charts.error}
        onRetry={refetchAll}
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <KpiTile label="Sản phẩm" value={fmtNum(stats.data?.productCount ?? 0)} icon={<Package size={16} color={C.primary} />} />
        <KpiTile label="Linh kiện" value={fmtNum(stats.data?.componentCount ?? 0)} icon={<Wrench size={16} color={C.teal} />} tint={C.teal} soft={C.greenSoft} />
        <KpiTile label="Đơn hàng" value={fmtNum(stats.data?.orderCount ?? 0)} icon={<ShoppingCart size={16} color={C.orange} />} tint={C.orange} soft={C.orangeSoft} />
      </View>

      <Card>
        <CardTitle>Doanh thu / Nợ – {year}</CardTitle>
        {monthRows.length === 0 ? (
          <Txt size={13} color={C.sub}>
            Chưa có dữ liệu doanh thu
          </Txt>
        ) : (
          <ColumnChart
            height={140}
            colors={[C.blue, C.green, C.red]}
            groups={monthRows.map((r) => ({ label: `T${r.month}`, values: [r.revenue, r.paid, r.debt] }))}
          />
        )}
        <Legend
          items={[
            { label: 'Tổng doanh thu', color: C.blue },
            { label: 'Đã thanh toán', color: C.green },
            { label: 'Nợ phải thu', color: C.red },
          ]}
        />
      </Card>

      <Card>
        <CardTitle>Tổng năm {year} – % Thanh toán / Nợ</CardTitle>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
          <Donut
            parts={[
              { value: sumPaid, color: C.green },
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
                {fmtShort(sumPaid)}
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
            { label: 'Tổng đơn', values: [totalQty] },
            { label: 'Đã giao', values: [deliveredQty] },
            { label: 'Còn lại', values: [Math.max(0, totalQty - deliveredQty)] },
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
        {pending > 0 ? (
          <Pressable onPress={() => router.push('/approvals')} style={{ marginTop: 10 }}>
            <Txt size={12} weight="700" color={C.primary}>
              {pending} yêu cầu đang chờ bạn duyệt →
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
        {saleRows.length === 0 ? (
          <Txt size={13} color={C.sub}>
            Chưa có dữ liệu
          </Txt>
        ) : (
          <HBars rows={saleRows} />
        )}
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
              {byCustomer.length === 0 ? (
                <Txt size={13} color={C.sub}>
                  Chưa có đơn hàng
                </Txt>
              ) : (
                byCustomer.slice(0, 5).map(([name, n]) => (
                  <View key={name} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Txt size={13}>{name}</Txt>
                    <Txt size={13} weight="700">
                      {n} đơn
                    </Txt>
                  </View>
                ))
              )}
              <Txt size={11} color={C.sub} style={{ marginTop: 4 }}>
                Tổng nợ phải thu hiện tại: {fmtShort(stats.data?.totalDebt ?? 0)}
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
        {(detail === 'month' ? byMonth.length : byCustomer.length) === 0 ? (
          <Txt size={13} color={C.sub}>
            Không có đơn hàng trong kỳ này
          </Txt>
        ) : (
          <HBars
            format={(n) => `${n} đơn`}
            rows={
              detail === 'month'
                ? byMonth.map(([mm, n]) => ({ label: `Tháng ${mm}/${year}`, value: n, color: C.blue }))
                : byCustomer.map(([name, n]) => ({ label: name, value: n, color: C.teal }))
            }
          />
        )}
      </Sheet>
    </Screen>
  );
}
