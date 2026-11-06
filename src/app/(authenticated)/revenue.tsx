import { Card, CardTitle, ColumnChart, HBars, KpiTile, Legend, Picker, Screen, Txt } from '@/src/features/omis/components';
import { MONTHS, SALES } from '@/src/features/omis/mock-data';
import { C, SALE_COLORS } from '@/src/features/omis/theme';
import { fmtShort } from '@/src/lib/format';
import { Coins, TrendingUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

const MONTH_OPTS = MONTHS.map((_, i) => ({ value: String(i), label: `Tháng ${i + 1}/2026` }));

/** Trang 2 – Doanh thu theo Sale (Admin) */
export default function RevenueScreen() {
  const [saleId, setSaleId] = useState('all');
  const [from, setFrom] = useState('0');
  const [to, setTo] = useState('9');

  const a = Math.min(Number(from), Number(to));
  const b = Math.max(Number(from), Number(to));

  const rows = useMemo(
    () =>
      SALES.map((s, i) => ({ sale: s, color: SALE_COLORS[i], value: s.monthly.slice(a, b + 1).reduce((x, y) => x + y, 0) })).filter(
        (r) => saleId === 'all' || r.sale.id === saleId,
      ),
    [saleId, a, b],
  );
  const total = rows.reduce((s, r) => s + r.value, 0);

  const monthly = MONTHS.slice(a, b + 1).map((m, i) => ({
    label: m,
    values: [rows.reduce((s, r) => s + r.sale.monthly[a + i], 0)],
  }));

  return (
    <Screen title="Doanh thu – Sale" subtitle="Theo nhân viên kinh doanh">
      <View style={{ gap: 10 }}>
        <Picker
          full
          label="Chọn NV KD"
          value={saleId}
          onChange={setSaleId}
          options={[{ value: 'all', label: 'Tất cả nhân viên' }, ...SALES.map((s) => ({ value: s.id, label: s.name }))]}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Picker label="Từ tháng" value={from} onChange={setFrom} options={MONTH_OPTS} />
          <Picker label="Đến tháng" value={to} onChange={setTo} options={MONTH_OPTS} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <KpiTile label="Tổng doanh thu" value={fmtShort(total)} icon={<Coins size={16} color={C.primary} />} />
        <KpiTile
          label="TB / tháng"
          value={fmtShort(total / (b - a + 1))}
          icon={<TrendingUp size={16} color={C.green} />}
          tint={C.green}
          soft={C.greenSoft}
        />
      </View>

      <Card>
        <CardTitle>Doanh thu / từng NV Sale</CardTitle>
        <HBars
          rows={[...rows].sort((x, y) => y.value - x.value).map((r) => ({ label: r.sale.name, value: r.value, color: r.color }))}
          onPressRow={(i) => {
            const id = [...rows].sort((x, y) => y.value - x.value)[i].sale.id;
            setSaleId((cur) => (cur === id ? 'all' : id));
          }}
        />
      </Card>

      <Card>
        <CardTitle>Diễn biến theo tháng</CardTitle>
        <ColumnChart groups={monthly} colors={[saleId === 'all' ? C.primary : SALE_COLORS[SALES.findIndex((s) => s.id === saleId)]]} height={130} />
        <Legend items={[{ label: saleId === 'all' ? 'Tổng doanh thu' : SALES.find((s) => s.id === saleId)!.name, color: C.primary }]} />
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <Txt size={15} weight="700">
            Bảng danh sách nhân viên sales
          </Txt>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <Row cells={['STT', 'Họ và tên', 'Ngày vào làm', 'Tuổi công tác', 'Chức vụ', 'Khu vực phụ trách', 'Mặt hàng phụ trách']} head />
            {SALES.map((s, i) => (
              <Row key={s.id} zebra={i % 2 === 1} cells={[String(i + 1), s.name, s.joined, s.tenure, s.position, s.region, s.focus]} />
            ))}
          </View>
        </ScrollView>
      </Card>
    </Screen>
  );
}

const W = [36, 110, 90, 80, 150, 130, 170];
function Row({ cells, head, zebra }: { cells: string[]; head?: boolean; zebra?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: head ? C.primarySoft : zebra ? '#F8FAFE' : '#fff', paddingVertical: 9, paddingHorizontal: 8 }}>
      {cells.map((c, i) => (
        <View key={i} style={{ width: W[i], paddingRight: 8 }}>
          <Txt size={11} weight={head ? '800' : '400'} color={head ? C.primary : C.text}>
            {c}
          </Txt>
        </View>
      ))}
    </View>
  );
}
