import { useSalesOptions, useSalesRevenue, useUsers } from '@/src/features/omis/api';
import { Card, CardTitle, ColumnChart, HBars, KpiTile, Legend, Picker, QueryState, Screen, Txt } from '@/src/features/omis/components';
import { C, SALE_COLORS } from '@/src/features/omis/theme';
import { fmtShort } from '@/src/lib/format';
import { Coins, TrendingUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

const THIS_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2].map((y) => ({ value: String(y), label: `Năm ${y}` }));

/** "2026-03" | "03" | "3" → "T3" */
const monthLabel = (m: string) => `T${parseInt(m.slice(-2).replace(/\D/g, ''), 10) || m}`;

/** Trang 2 – Doanh thu theo Sale (Admin) */
export default function RevenueScreen() {
  const [year, setYear] = useState(String(THIS_YEAR));
  const [saleId, setSaleId] = useState('all');
  const y = Number(year);

  const salesOptions = useSalesOptions();
  const users = useUsers();
  const ranking = useSalesRevenue(y); // xếp hạng tất cả Sale
  const monthly = useSalesRevenue(y, saleId === 'all' ? undefined : saleId); // doanh thu theo tháng của 1 Sale

  const rows = useMemo(
    () =>
      (ranking.data?.ranking ?? [])
        .map((s, i) => ({ id: s.id, label: s.fullName || s.userName, value: s.revenue, color: SALE_COLORS[i % SALE_COLORS.length] }))
        .filter((r) => saleId === 'all' || r.id === saleId)
        .sort((a, b) => b.value - a.value),
    [ranking.data, saleId],
  );
  const total = rows.reduce((s, r) => s + r.value, 0);

  // BE chỉ trả doanh thu theo tháng khi chọn 1 Sale
  const monthlyGroups = (monthly.data?.monthly ?? []).map((m) => ({ label: monthLabel(m.month), values: [m.revenue] }));
  const activeMonths = monthlyGroups.filter((g) => g.values[0] > 0).length || 1;

  const revenueById = new Map((ranking.data?.ranking ?? []).map((s) => [s.id, s.revenue]));
  const staff = (users.data ?? []).filter((u) => u.role === 'sales');

  const refetch = () => {
    ranking.refetch();
    monthly.refetch();
    users.refetch();
    salesOptions.refetch();
  };

  return (
    <Screen title="Doanh thu – Sale" subtitle="Theo nhân viên kinh doanh" onRefresh={refetch} refreshing={ranking.isRefetching}>
      <View style={{ gap: 10 }}>
        <Picker
          full
          label="Chọn NV KD"
          value={saleId}
          onChange={setSaleId}
          options={[{ value: 'all', label: 'Tất cả nhân viên' }, ...(salesOptions.data ?? []).map((s) => ({ value: s.id, label: s.fullName || s.userName }))]}
        />
        <Picker full label="Năm" value={year} onChange={setYear} options={YEAR_OPTIONS} />
      </View>

      <QueryState loading={ranking.isLoading} error={ranking.error} onRetry={refetch} />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <KpiTile label="Tổng doanh thu" value={fmtShort(total)} icon={<Coins size={16} color={C.primary} />} />
        <KpiTile
          label="TB / tháng có doanh thu"
          value={fmtShort(total / activeMonths)}
          icon={<TrendingUp size={16} color={C.green} />}
          tint={C.green}
          soft={C.greenSoft}
        />
      </View>

      <Card>
        <CardTitle>Doanh thu / từng NV Sale</CardTitle>
        {rows.length === 0 ? (
          <Txt size={13} color={C.sub}>
            Chưa có dữ liệu doanh thu
          </Txt>
        ) : (
          <HBars rows={rows} onPressRow={(i) => setSaleId((cur) => (cur === rows[i].id ? 'all' : rows[i].id))} />
        )}
      </Card>

      {saleId !== 'all' ? (
        <Card>
          <CardTitle>Diễn biến theo tháng</CardTitle>
          <QueryState loading={monthly.isLoading} error={monthly.error} onRetry={() => monthly.refetch()} />
          {monthlyGroups.length > 0 ? <ColumnChart groups={monthlyGroups} colors={[C.primary]} height={130} /> : null}
          <Legend items={[{ label: rows[0]?.label ?? 'Doanh thu', color: C.primary }]} />
        </Card>
      ) : null}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <Txt size={15} weight="700">
            Bảng danh sách nhân viên sales
          </Txt>
        </View>
        {users.isLoading ? <QueryState loading /> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <TableRow cells={['STT', 'Họ và tên', 'Tài khoản', 'Doanh thu']} head />
            {staff.map((s, i) => (
              <TableRow
                key={s.id}
                zebra={i % 2 === 1}
                cells={[String(i + 1), s.fullName || '—', s.userName, fmtShort(revenueById.get(s.id) ?? 0)]}
              />
            ))}
          </View>
        </ScrollView>
      </Card>
    </Screen>
  );
}

const W = [40, 170, 130, 100];
function TableRow({ cells, head, zebra }: { cells: string[]; head?: boolean; zebra?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: head ? C.primarySoft : zebra ? '#F8FAFE' : '#fff', paddingVertical: 9, paddingHorizontal: 8 }}>
      {cells.map((c, i) => (
        <View key={i} style={{ width: W[i], paddingRight: 8 }}>
          <Txt size={11} weight={head ? '800' : '400'} color={head ? C.primary : C.text} align={i === 3 ? 'right' : 'left'}>
            {c}
          </Txt>
        </View>
      ))}
    </View>
  );
}
