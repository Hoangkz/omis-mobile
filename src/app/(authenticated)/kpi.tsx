import { Card, CardTitle, ColumnChart, KpiTile, Legend, Progress, Row, Screen, Txt } from '@/src/features/omis/components';
import { MONTHS, PRODUCTS, SALES } from '@/src/features/omis/mock-data';
import { useOmisStore } from '@/src/features/omis/store';
import { C } from '@/src/features/omis/theme';
import { fmtNum, fmtShort } from '@/src/lib/format';
import { useAuthStore } from '@/src/shared/store/use-auth-store';
import { ShoppingCart, Target } from 'lucide-react-native';
import { View } from 'react-native';

/** Sale – xem báo cáo KPIs của mình */
export default function KpiScreen() {
  const user = useAuthStore((s) => s.user);
  const orders = useOmisStore((s) => s.orders);
  const sale = SALES.find((s) => s.id === user?.saleId) ?? SALES[0];

  const mine = orders.filter((o) => o.saleId === sale.id);
  const done = sale.monthly.reduce((a, b) => a + b, 0);
  const pct = done / sale.kpiTarget;
  const monthTarget = sale.kpiTarget / 12;
  const price = (code: string) => PRODUCTS.find((p) => p.code === code)?.price ?? 0;
  const debt = mine.reduce((s, o) => s + o.qty * price(o.productCode) - o.paid, 0);

  return (
    <Screen title="KPIs của tôi" subtitle={`${sale.name} · ${sale.position}`}>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Txt size={12} color={C.sub}>
              Doanh thu đạt được 2026
            </Txt>
            <Txt size={28} weight="800" color={C.primary}>
              {fmtShort(done)}
            </Txt>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Txt size={12} color={C.sub}>
              Mục tiêu năm
            </Txt>
            <Txt size={16} weight="700">
              {fmtShort(sale.kpiTarget)}
            </Txt>
          </View>
        </View>
        <Progress value={pct} color={pct >= 0.8 ? C.green : C.primary} />
        <Txt size={12} weight="700" color={C.sub}>
          Hoàn thành {Math.round(pct * 100)}% KPI năm
        </Txt>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <KpiTile label="Đơn hàng của tôi" value={String(mine.length)} icon={<ShoppingCart size={16} color={C.orange} />} tint={C.orange} soft={C.orangeSoft} />
        <KpiTile label="Công nợ khách" value={fmtShort(debt)} icon={<Target size={16} color={C.red} />} tint={C.red} soft={C.redSoft} />
      </View>

      <Card>
        <CardTitle>Doanh thu theo tháng so với mục tiêu</CardTitle>
        <ColumnChart
          height={140}
          colors={[C.blue, C.gray]}
          groups={MONTHS.slice(0, 10).map((m, i) => ({ label: m, values: [sale.monthly[i], monthTarget] }))}
        />
        <Legend
          items={[
            { label: 'Thực tế', color: C.blue },
            { label: 'Mục tiêu / tháng', color: C.gray },
          ]}
        />
      </Card>

      <Card>
        <CardTitle>Thông tin</CardTitle>
        <Row label="Khu vực phụ trách" value={sale.region} />
        <Row label="Mặt hàng phụ trách" value={sale.focus} />
        <Row label="Ngày vào làm" value={sale.joined} />
        <Row label="Tổng SL đã bán" value={fmtNum(mine.reduce((s, o) => s + o.qty, 0))} />
      </Card>
    </Screen>
  );
}
