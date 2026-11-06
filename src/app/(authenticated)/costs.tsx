import { Card, CardTitle, Legend, Picker, Row, Screen, StackedRows } from '@/src/features/omis/components';
import { costByMonth, MONTHS, PRODUCTS } from '@/src/features/omis/mock-data';
import { C } from '@/src/features/omis/theme';
import { fmtShort, fmtVnd } from '@/src/lib/format';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

const MONTH_OPTS = [{ value: 'all', label: 'Cả năm' }, ...MONTHS.slice(0, 10).map((_, i) => ({ value: String(i), label: `Tháng ${i + 1}/2026` }))];

/** Trang 3 – Chi phí: chi phí vật tư / lợi nhuận / giá bán theo BOM / mã hàng */
export default function CostsScreen() {
  const [month, setMonth] = useState('all');
  const [code, setCode] = useState('all');

  const data = useMemo(() => costByMonth(code), [code]);
  const shown = month === 'all' ? data : [data[Number(month)]];
  const sum = shown.reduce(
    (s, d) => ({ material: s.material + d.material, profit: s.profit + d.profit, sell: s.sell + d.sell }),
    { material: 0, profit: 0, sell: 0 },
  );
  const margin = sum.sell ? Math.round((sum.profit / sum.sell) * 100) : 0;

  return (
    <Screen title="Chi phí" subtitle="Chi phí vật tư · Lợi nhuận · Giá bán">
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Picker label="Lọc CP / Tháng" value={month} onChange={setMonth} options={MONTH_OPTS} />
        <Picker
          label="BOM / Mã hàng"
          value={code}
          onChange={setCode}
          options={[{ value: 'all', label: 'Tất cả mã hàng' }, ...PRODUCTS.map((p) => ({ value: p.code, label: `${p.code} · ${p.bom}` }))]}
        />
      </View>

      <Card>
        <CardTitle>Cơ cấu giá bán</CardTitle>
        <StackedRows
          colors={[C.red, C.green]}
          rows={shown.map((d) => ({ label: d.month, parts: [d.material, d.profit], total: d.sell }))}
        />
        <Legend
          items={[
            { label: 'Chi phí vật tư', color: C.red },
            { label: 'Lợi nhuận', color: C.green },
            { label: 'Giá bán = tổng 2 phần', color: C.line },
          ]}
        />
      </Card>

      <Card>
        <CardTitle>Tổng hợp {month === 'all' ? 'cả năm' : `tháng ${Number(month) + 1}`}</CardTitle>
        <Row label="Chi phí vật tư" value={fmtVnd(sum.material)} />
        <Row label="Lợi nhuận" value={fmtVnd(sum.profit)} />
        <View style={{ height: 1, backgroundColor: C.line, marginVertical: 6 }} />
        <Row label="Giá bán" value={fmtVnd(sum.sell)} bold />
        <Row label="Biên lợi nhuận" value={`${margin}%`} bold />
      </Card>

      {code === 'all' ? (
        <Card>
          <CardTitle>Theo mã hàng (đơn vị)</CardTitle>
          {PRODUCTS.map((p) => (
            <View key={p.code} style={{ paddingVertical: 6 }}>
              <Row label={`${p.code} · ${p.name}`} value={fmtShort(p.price)} />
              <Row label="  Vật tư" value={fmtShort(p.materialCost)} />
              <Row label="  Lợi nhuận" value={fmtShort(p.price - p.materialCost)} />
            </View>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}
