import { useOrders } from '@/src/features/omis/api';
import { Card, CardTitle, ColumnChart, KpiTile, Progress, QueryState, Row, Screen, Txt } from '@/src/features/omis/components';
import { C } from '@/src/features/omis/theme';
import { fmtNum, fmtShort } from '@/src/lib/format';
import { MONTHS } from '@/src/lib/months';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { ShoppingCart, Wallet } from 'lucide-react-native';
import { useMemo } from 'react';
import { View } from 'react-native';

/** Sale – xem báo cáo KPIs của mình (tính từ các đơn của chính mình) */
export default function KpiScreen() {
  const user = useAuthStore((s) => s.user);
  const orders = useOrders();
  const year = new Date().getFullYear();

  const mine = useMemo(() => (orders.data ?? []).filter((o) => o.salespersonId === user?.id), [orders.data, user?.id]);
  const thisYear = useMemo(() => mine.filter((o) => new Date(o.orderDate).getFullYear() === year), [mine, year]);

  const monthly = useMemo(() => {
    const arr = Array(12).fill(0) as number[];
    thisYear.forEach((o) => (arr[new Date(o.orderDate).getMonth()] += o.orderTotal ?? 0));
    return arr;
  }, [thisYear]);

  const revenue = monthly.reduce((a, b) => a + b, 0);
  const debt = mine.reduce((s, o) => s + (o.orderDebt ?? 0), 0);
  const qty = mine.reduce((s, o) => s + o.orderItems.reduce((x, i) => x + i.quantity, 0), 0);
  const delivered = mine.reduce((s, o) => s + o.orderItems.reduce((x, i) => x + i.deliveredQuantity, 0), 0);
  const deliveredPct = qty ? delivered / qty : 0;
  const lastMonth = new Date().getMonth();

  return (
    <Screen title="KPIs của tôi" subtitle={user?.name ?? ''} onRefresh={() => orders.refetch()} refreshing={orders.isRefetching}>
      <QueryState loading={orders.isLoading} error={orders.error} onRetry={() => orders.refetch()} />

      {orders.data ? (
        <>
          <Card style={{ gap: 12 }}>
            <View>
              <Txt size={12} color={C.sub}>
                Doanh thu {year}
              </Txt>
              <Txt size={28} weight="800" color={C.primary}>
                {fmtShort(revenue)}
              </Txt>
            </View>
            <Progress value={deliveredPct} color={deliveredPct >= 0.8 ? C.green : C.primary} />
            <Txt size={12} weight="700" color={C.sub}>
              Đã giao {Math.round(deliveredPct * 100)}% số lượng đã bán ({fmtNum(delivered)}/{fmtNum(qty)})
            </Txt>
          </Card>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <KpiTile label="Đơn hàng của tôi" value={String(mine.length)} icon={<ShoppingCart size={16} color={C.orange} />} tint={C.orange} soft={C.orangeSoft} />
            <KpiTile label="Công nợ khách" value={fmtShort(debt)} icon={<Wallet size={16} color={C.red} />} tint={C.red} soft={C.redSoft} />
          </View>

          <Card>
            <CardTitle>Doanh thu theo tháng – {year}</CardTitle>
            <ColumnChart height={140} colors={[C.blue]} groups={MONTHS.slice(0, lastMonth + 1).map((m, i) => ({ label: m, values: [monthly[i]] }))} />
          </Card>

          <Card>
            <CardTitle>Thông tin</CardTitle>
            <Row label="Tài khoản" value={user?.userName ?? '—'} />
            <Row label="Tổng đơn" value={fmtNum(mine.length)} />
            <Row label="Tổng SL đã bán" value={fmtNum(qty)} />
            <Row label="Đơn đã hoàn thành" value={fmtNum(mine.filter((o) => o.status === 'completed').length)} />
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
