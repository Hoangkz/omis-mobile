import { first, useCustomerGrossProfit, useMonthlyExpenses } from '@/src/features/omis/api';
import { Card, CardTitle, ColumnChart, HBars, Legend, Picker, QueryState, Row, Screen, StackedRows } from '@/src/features/omis/components';
import { C } from '@/src/features/omis/theme';
import { fmtShort, fmtVnd } from '@/src/lib/format';
import { MONTHS } from '@/src/lib/months';
import { useState } from 'react';
import { View } from 'react-native';

const THIS_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2].map((y) => ({ value: String(y), label: `Năm ${y}` }));
const MONTH_OPTIONS = [{ value: 'all', label: 'Cả năm' }, ...MONTHS.map((_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }))];

/** Trang 3 – Chi phí: giá vốn / lợi nhuận / doanh thu theo khách + chi phí phát sinh theo tháng */
export default function CostsScreen() {
  const [year, setYear] = useState(String(THIS_YEAR));
  const [month, setMonth] = useState('all');
  const y = Number(year);
  const m = month === 'all' ? undefined : Number(month);

  const expenses = useMonthlyExpenses(y);
  const profit = useCustomerGrossProfit(y, m);

  const totals = first(profit.data?.totals);
  const margin = totals?.margin ?? (totals?.revenue ? (totals.grossProfit / totals.revenue) * 100 : 0);
  const customers = (profit.data?.rows ?? []).filter((r) => r.revenue > 0);

  const refetch = () => {
    expenses.refetch();
    profit.refetch();
  };

  return (
    <Screen title="Chi phí" subtitle="Chi phí · Lợi nhuận · Doanh thu" onRefresh={refetch} refreshing={profit.isRefetching || expenses.isRefetching}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Picker label="Năm" value={year} onChange={setYear} options={YEAR_OPTIONS} />
        <Picker label="Lọc theo tháng" value={month} onChange={setMonth} options={MONTH_OPTIONS} />
      </View>

      <QueryState loading={profit.isLoading || expenses.isLoading} error={profit.error ?? expenses.error} onRetry={refetch} />

      {profit.data ? (
        <>
          <Card>
            <CardTitle>Cơ cấu doanh thu theo khách hàng</CardTitle>
            {customers.length === 0 ? (
              <Row label="Chưa có dữ liệu" value="—" />
            ) : (
              <StackedRows
                colors={[C.red, C.green]}
                rows={customers.slice(0, 10).map((r) => ({
                  label: String(r.customerName ?? "").slice(0, 4),
                  parts: [Math.max(0, r.cost), Math.max(0, r.grossProfit)],
                  total: r.revenue,
                }))}
              />
            )}
            <Legend
              items={[
                { label: 'Giá vốn hàng bán', color: C.red },
                { label: 'Lợi nhuận gộp', color: C.green },
                { label: 'Doanh thu = tổng 2 phần', color: C.line },
              ]}
            />
          </Card>

          <Card>
            <CardTitle>Tổng hợp {month === 'all' ? `năm ${year}` : `tháng ${month}/${year}`}</CardTitle>
            <Row label="Doanh thu" value={fmtVnd(totals?.revenue ?? 0)} bold />
            <Row label="Giá vốn hàng bán" value={fmtVnd(totals?.cost ?? 0)} />
            <Row label="Lợi nhuận gộp" value={fmtVnd(totals?.grossProfit ?? 0)} />
            <Row label="Biên lợi nhuận" value={`${Math.round(margin)}%`} bold />
          </Card>

          {customers.length > 0 ? (
            <Card>
              <CardTitle>Chi tiết theo khách hàng</CardTitle>
              {customers.map((r) => (
                <View key={r.customerKey} style={{ paddingVertical: 6 }}>
                  <Row label={r.customerName} value={fmtShort(r.revenue)} bold />
                  <Row label="  Giá vốn" value={fmtShort(r.cost)} />
                  <Row label="  Lợi nhuận" value={fmtShort(r.grossProfit)} />
                </View>
              ))}
            </Card>
          ) : null}
        </>
      ) : null}

      {expenses.data ? (
        <>
          <Card>
            <CardTitle>Chi phí phát sinh theo tháng – {year}</CardTitle>
            <ColumnChart
              height={130}
              colors={[C.red, C.orange, C.gray]}
              groups={(expenses.data.months ?? []).map((e) => ({ label: `T${e.month}`, values: [e.incurred, e.committed, e.pending] }))}
            />
            <Legend
              items={[
                { label: 'Đã phát sinh', color: C.red },
                { label: 'Đã duyệt chưa nhận', color: C.orange },
                { label: 'Chờ duyệt', color: C.gray },
              ]}
            />
          </Card>

          {(expenses.data.byCategory ?? []).length > 0 ? (
            <Card>
              <CardTitle>Chi phí theo loại</CardTitle>
              <HBars rows={(expenses.data.byCategory ?? []).map((c) => ({ label: c.name, value: c.amount, color: C.primary }))} />
            </Card>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
