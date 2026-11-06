import {
  ChangeRequest,
  PurchaseRequest,
  useChangeRequests,
  useDecideChangeRequest,
  useDecidePurchaseRequest,
  usePurchaseRequests,
} from '@/src/features/omis/api';
import { Badge, Btn, Card, Field, QueryState, Row, Screen, Txt } from '@/src/features/omis/components';
import { C } from '@/src/features/omis/theme';
import { getApiErrorMessage } from '@/src/lib/api-error';
import { fmtNum, fmtVnd } from '@/src/lib/format';
import { ArrowLeft, Check, ChevronRight, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

const KIND = { buy: { label: 'Duyệt Mua', color: C.orange }, edit: { label: 'Duyệt Sửa Khác', color: C.red } };

type Tone = 'orange' | 'green' | 'red' | 'blue' | 'gray';
const PR_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Chờ phê duyệt', tone: 'orange' },
  approved: { label: 'Đã duyệt', tone: 'green' },
  rejected: { label: 'Từ chối', tone: 'red' },
  purchased: { label: 'Đã mua', tone: 'blue' },
  completed: { label: 'Hoàn thành', tone: 'green' },
};
const prStatus = (s: string | null) => PR_STATUS[s ?? ''] ?? { label: s ?? '—', tone: 'gray' as Tone };

const ENTITY: Record<string, string> = {
  order: 'Đơn hàng',
  order_item: 'Dòng đơn hàng',
  component: 'Linh kiện',
  product: 'Sản phẩm',
  bom_item: 'Dòng BOM',
};

const dmy = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
const lineTotal = (q: number, price: number | null, vat: number | null) => Math.round(q * (price ?? 0) * (1 + (vat ?? 0) / 100));
const show = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v));

/** Trang 3 – Phê duyệt: yêu cầu mua hàng và đề xuất sửa */
export default function ApprovalsScreen() {
  const [tab, setTab] = useState<'buy' | 'edit'>('buy');
  const [openPr, setOpenPr] = useState<number | null>(null);
  const [openCr, setOpenCr] = useState<number | null>(null);

  const prs = usePurchaseRequests();
  const crs = useChangeRequests();

  const pr = prs.data?.find((r) => r.id === openPr);
  const cr = crs.data?.find((r) => r.id === openCr);

  if (pr) return <PurchaseDetail pr={pr} onClose={() => setOpenPr(null)} />;
  if (cr) return <ChangeDetail cr={cr} onClose={() => setOpenCr(null)} />;

  const pendingPr = (prs.data ?? []).filter((r) => r.status === 'pending').length;
  const pendingCr = (crs.data ?? []).filter((r) => r.status === 'pending').length;
  const count = { buy: pendingPr, edit: pendingCr };
  const active = tab === 'buy' ? prs : crs;

  return (
    <Screen
      title="Phê duyệt"
      subtitle="Yêu cầu mua hàng & chỉnh sửa"
      onRefresh={() => {
        prs.refetch();
        crs.refetch();
      }}
      refreshing={prs.isRefetching || crs.isRefetching}
    >
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {(['buy', 'edit'] as const).map((k) => {
          const on = tab === k;
          return (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 14,
                backgroundColor: on ? KIND[k].color : '#fff',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
                borderWidth: 1,
                borderColor: on ? KIND[k].color : C.line,
              }}
            >
              <Txt size={14} weight="700" color={on ? '#fff' : C.text}>
                {KIND[k].label}
              </Txt>
              {count[k] > 0 ? (
                <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: on ? '#fff' : KIND[k].color, alignItems: 'center', justifyContent: 'center' }}>
                  <Txt size={11} weight="800" color={on ? KIND[k].color : '#fff'}>
                    {count[k]}
                  </Txt>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <QueryState loading={active.isLoading} error={active.error} onRetry={() => active.refetch()} />

      {tab === 'buy' &&
        prs.data &&
        (prs.data.length === 0 ? (
          <Empty />
        ) : (
          prs.data.map((r) => {
            const st = prStatus(r.status);
            const total = r.items.reduce((s, i) => s + lineTotal(i.quantity, i.unitPrice, i.vatRate), 0);
            return (
              <Pressable key={r.id} onPress={() => setOpenPr(r.id)}>
                <Card style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Txt size={11} weight="700" color={C.sub}>
                      {r.requestCode}
                    </Txt>
                    <Badge label={st.label} tone={st.tone} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Txt size={16} weight="800">
                        {r.productName ?? 'Yêu cầu mua hàng'}
                      </Txt>
                      <Txt size={12} color={C.sub} style={{ marginTop: 2 }}>
                        {r.createdBy ?? '—'} · {dmy(r.createdAt)} · {r.items.length} linh kiện
                      </Txt>
                    </View>
                    <ChevronRight size={20} color={C.sub} />
                  </View>
                  <Txt size={15} weight="800" color={C.primary}>
                    {fmtVnd(total)}
                  </Txt>
                </Card>
              </Pressable>
            );
          })
        ))}

      {tab === 'edit' &&
        crs.data &&
        (crs.data.length === 0 ? (
          <Empty />
        ) : (
          crs.data.map((r) => (
            <Pressable key={r.id} onPress={() => setOpenCr(r.id)}>
              <Card style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Txt size={11} weight="700" color={C.sub}>
                    {ENTITY[r.entity] ?? r.entity}
                  </Txt>
                  <Badge label={r.status === 'pending' ? 'Chờ phê duyệt' : r.status} tone="orange" />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Txt size={16} weight="800">
                      {r.entityLabel ?? `#${r.entityId}`}
                    </Txt>
                    <Txt size={12} color={C.sub} style={{ marginTop: 2 }}>
                      {r.createdByName ?? r.createdByUserName ?? '—'} · {dmy(r.createdAt)}
                    </Txt>
                  </View>
                  <ChevronRight size={20} color={C.sub} />
                </View>
              </Card>
            </Pressable>
          ))
        ))}
    </Screen>
  );
}

function Empty() {
  return (
    <Txt color={C.sub} align="center" style={{ paddingVertical: 30 }}>
      Không có yêu cầu nào
    </Txt>
  );
}

/* ------------------------------------------------------------------ */

function PurchaseDetail({ pr, onClose }: { pr: PurchaseRequest; onClose: () => void }) {
  const decide = useDecidePurchaseRequest();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const st = prStatus(pr.status);
  const total = pr.items.reduce((s, i) => s + lineTotal(i.quantity, i.unitPrice, i.vatRate), 0);
  const pending = pr.status === 'pending';

  const act = async (decision: 'approved' | 'rejected') => {
    setError('');
    try {
      await decide.mutateAsync({ id: pr.id, decision, rejectionReason: decision === 'rejected' ? reason.trim() : undefined });
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <Screen
      title={pr.productName ?? pr.requestCode}
      subtitle={`${pr.requestCode} · ${dmy(pr.createdAt)} · ${pr.createdBy ?? '—'}`}
      right={
        <Pressable onPress={onClose} hitSlop={10}>
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
      }
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt size={13} weight="700" color={C.sub}>
          CHI TIẾT YÊU CẦU MUA HÀNG
        </Txt>
        <Badge label={st.label} tone={st.tone} />
      </View>

      {pr.notes ? (
        <Card style={{ backgroundColor: C.orangeSoft }}>
          <Txt size={11} weight="700" color="#B45309">
            GHI CHÚ
          </Txt>
          <Txt size={14} style={{ marginTop: 4 }}>
            {pr.notes}
          </Txt>
        </Card>
      ) : null}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <TableRow head cells={['STT', 'Tên linh kiện', 'Mã', 'NCC', 'SL', 'Đơn giá', 'VAT', 'Thành tiền']} />
            {pr.items.map((l, i) => (
              <TableRow
                key={`${l.componentCode}-${i}`}
                zebra={i % 2 === 1}
                cells={[
                  String(i + 1),
                  l.componentName ?? '—',
                  l.componentCode,
                  l.supplier || pr.supplier || '—',
                  fmtNum(l.quantity),
                  fmtNum(l.unitPrice ?? 0),
                  `${l.vatRate ?? 0}%`,
                  fmtNum(lineTotal(l.quantity, l.unitPrice, l.vatRate)),
                ]}
              />
            ))}
          </View>
        </ScrollView>
      </Card>

      <Card>
        <Row label="Tổng cộng (gồm VAT)" value={fmtVnd(total)} bold />
      </Card>

      {pending ? (
        <Card style={{ gap: 10 }}>
          <Txt size={14} weight="700">
            Lý do từ chối (nếu từ chối)
          </Txt>
          <Field value={reason} onChangeText={setReason} multiline placeholder="VD: Linh kiện số TT 12 mua NCC khác để giảm giá…" />
        </Card>
      ) : pr.rejectionReason ? (
        <Card>
          <Txt size={14} weight="700">
            Lý do từ chối
          </Txt>
          <Txt size={14} style={{ marginTop: 4 }}>
            {pr.rejectionReason}
          </Txt>
        </Card>
      ) : null}

      {error ? (
        <Txt size={12} color={C.red}>
          {error}
        </Txt>
      ) : null}

      {pending ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn tone="danger" label="Từ chối" onPress={() => act('rejected')} disabled={decide.isPending} icon={<X size={18} color="#fff" />} style={{ flex: 1 }} />
          <Btn tone="success" label="Phê duyệt" onPress={() => act('approved')} disabled={decide.isPending} icon={<Check size={18} color="#fff" />} style={{ flex: 1 }} />
        </View>
      ) : null}
    </Screen>
  );
}

function ChangeDetail({ cr, onClose }: { cr: ChangeRequest; onClose: () => void }) {
  const decide = useDecideChangeRequest();
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const pending = cr.status === 'pending';

  // Các trường bị sửa: trước → sau
  const changes = Object.keys(cr.payload ?? {}).map((k) => ({ key: k, before: cr.before?.[k], after: cr.payload[k] }));

  const act = async (approve: boolean) => {
    setError('');
    try {
      await decide.mutateAsync({ id: cr.id, approve, note: note.trim() });
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <Screen
      title={cr.entityLabel ?? `#${cr.entityId}`}
      subtitle={`${ENTITY[cr.entity] ?? cr.entity} · ${cr.createdByName ?? cr.createdByUserName ?? '—'} · ${dmy(cr.createdAt)}`}
      right={
        <Pressable onPress={onClose} hitSlop={10}>
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
      }
    >
      {cr.reason ? (
        <Card style={{ backgroundColor: C.orangeSoft }}>
          <Txt size={11} weight="700" color="#B45309">
            NỘI DUNG NHÂN VIÊN YÊU CẦU SỬA
          </Txt>
          <Txt size={14} style={{ marginTop: 4 }}>
            {cr.reason}
          </Txt>
        </Card>
      ) : null}

      <Card style={{ gap: 10 }}>
        <Txt size={14} weight="700">
          Thay đổi đề xuất
        </Txt>
        {changes.length === 0 ? (
          <Txt size={13} color={C.sub}>
            Không có chi tiết thay đổi
          </Txt>
        ) : (
          changes.map((c) => (
            <View key={c.key} style={{ gap: 2 }}>
              <Txt size={11} weight="700" color={C.sub}>
                {c.key}
              </Txt>
              <Txt size={13} color={C.red}>
                {show(c.before)}
              </Txt>
              <Txt size={13} weight="700" color={C.green}>
                → {show(c.after)}
              </Txt>
            </View>
          ))
        )}
      </Card>

      {pending ? (
        <Card style={{ gap: 10 }}>
          <Txt size={14} weight="700">
            Ghi chú phản hồi
          </Txt>
          <Field value={note} onChangeText={setNote} multiline placeholder="Ghi chú cho người đề xuất (không bắt buộc)" />
        </Card>
      ) : cr.decideNote ? (
        <Card>
          <Txt size={14} weight="700">
            Phản hồi
          </Txt>
          <Txt size={14} style={{ marginTop: 4 }}>
            {cr.decideNote}
          </Txt>
        </Card>
      ) : null}

      {error ? (
        <Txt size={12} color={C.red}>
          {error}
        </Txt>
      ) : null}

      {pending ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn tone="danger" label="Từ chối" onPress={() => act(false)} disabled={decide.isPending} icon={<X size={18} color="#fff" />} style={{ flex: 1 }} />
          <Btn tone="success" label="Phê duyệt" onPress={() => act(true)} disabled={decide.isPending} icon={<Check size={18} color="#fff" />} style={{ flex: 1 }} />
        </View>
      ) : null}
    </Screen>
  );
}

const WIDTHS = [36, 190, 100, 110, 50, 80, 44, 96];

function TableRow({ cells, head, zebra }: { cells: string[]; head?: boolean; zebra?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: head ? C.primarySoft : zebra ? '#F8FAFE' : '#fff', paddingVertical: 9, paddingHorizontal: 8 }}>
      {cells.map((c, i) => (
        <View key={i} style={{ width: WIDTHS[i], paddingRight: 6 }}>
          <Txt size={11} weight={head ? '800' : '400'} color={head ? C.primary : C.text} align={i >= 4 ? 'right' : 'left'}>
            {c}
          </Txt>
        </View>
      ))}
    </View>
  );
}
