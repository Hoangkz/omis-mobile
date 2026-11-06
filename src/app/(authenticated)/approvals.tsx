import { Badge, Btn, Card, Field, Row, Screen, Txt } from '@/src/features/omis/components';
import { ApprovalRequest, lineTotal } from '@/src/features/omis/mock-data';
import { useOmisStore } from '@/src/features/omis/store';
import { C } from '@/src/features/omis/theme';
import { fmtNum, fmtVnd } from '@/src/lib/format';
import { ArrowLeft, Check, ChevronRight, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

const KIND = { buy: { label: 'Duyệt Mua', color: C.orange }, edit: { label: 'Duyệt Sửa Khác', color: C.red } };
const STATUS = {
  pending: { label: 'Chờ phê duyệt', tone: 'orange' },
  approved: { label: 'Đã duyệt', tone: 'green' },
  rejected: { label: 'Từ chối', tone: 'red' },
} as const;

/** Trang 3 – Phê duyệt mua hàng / yêu cầu sửa */
export default function ApprovalsScreen() {
  const requests = useOmisStore((s) => s.requests);
  const decide = useOmisStore((s) => s.decideRequest);
  const [tab, setTab] = useState<'buy' | 'edit'>('buy');
  const [openId, setOpenId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const open = requests.find((r) => r.id === openId);

  if (open) {
    const total = open.lines.reduce((s, l) => s + lineTotal(l), 0);
    const done = open.status !== 'pending';
    const act = (status: 'approved' | 'rejected') => {
      decide(open.id, status, feedback.trim());
      setOpenId(null);
      setFeedback('');
    };
    return (
      <Screen
        title={open.title}
        subtitle={`${open.id} · ${open.createdAt} · ${open.creator}`}
        right={
          <Pressable onPress={() => setOpenId(null)} hitSlop={10}>
            <ArrowLeft size={24} color="#fff" />
          </Pressable>
        }
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt size={13} weight="700" color={C.sub}>
            CHI TIẾT YÊU CẦU MUA HÀNG
          </Txt>
          <Badge label={STATUS[open.status].label} tone={STATUS[open.status].tone} />
        </View>

        {open.editNote ? (
          <Card style={{ backgroundColor: C.orangeSoft }}>
            <Txt size={11} weight="700" color="#B45309">
              NỘI DUNG NHÂN VIÊN YÊU CẦU SỬA
            </Txt>
            <Txt size={14} style={{ marginTop: 4 }}>
              {open.editNote}
            </Txt>
          </Card>
        ) : null}

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <TableRow head cells={['STT', 'Tên linh kiện', 'Mã', 'NCC', 'SL', 'Đơn giá', 'VAT', 'Thành tiền']} />
              {open.lines.map((l, i) => (
                <TableRow
                  key={l.code}
                  zebra={i % 2 === 1}
                  cells={[String(i + 1), l.name, l.code, l.supplier, String(l.need), fmtNum(l.unitPrice), `${l.vat}%`, fmtNum(lineTotal(l))]}
                />
              ))}
            </View>
          </ScrollView>
        </Card>

        <Card>
          <Row label="Tổng cộng (gồm VAT)" value={fmtVnd(total)} bold />
        </Card>

        <Card style={{ gap: 10 }}>
          <Txt size={14} weight="700">
            Phản hồi
          </Txt>
          {done ? (
            <Txt size={14} color={open.feedback ? C.text : C.sub}>
              {open.feedback || 'Không có phản hồi'}
            </Txt>
          ) : (
            <>
              <Field
                value={feedback}
                onChangeText={setFeedback}
                multiline
                placeholder="VD: Linh kiện số TT 12 mua NCC khác để giảm giá…"
              />
              <Txt size={11} color={C.sub}>
                Có thể Duyệt mua hết nhưng ghi chú phản hồi cho bộ phận mua hàng/kế toán (đổi NCC…), hoặc Từ chối và ghi chú yêu cầu tạo đơn lại.
              </Txt>
            </>
          )}
        </Card>

        {!done ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn tone="danger" label="Từ chối" onPress={() => act('rejected')} icon={<X size={18} color="#fff" />} style={{ flex: 1 }} />
            <Btn tone="success" label="Phê duyệt" onPress={() => act('approved')} icon={<Check size={18} color="#fff" />} style={{ flex: 1 }} />
          </View>
        ) : null}
      </Screen>
    );
  }

  const list = requests.filter((r) => r.kind === tab);
  const pending = (k: 'buy' | 'edit') => requests.filter((r) => r.kind === k && r.status === 'pending').length;

  return (
    <Screen title="Phê duyệt" subtitle="Yêu cầu mua hàng & chỉnh sửa">
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {(['buy', 'edit'] as const).map((k) => {
          const active = tab === k;
          return (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 14,
                backgroundColor: active ? KIND[k].color : '#fff',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
                borderWidth: 1,
                borderColor: active ? KIND[k].color : C.line,
              }}
            >
              <Txt size={14} weight="700" color={active ? '#fff' : C.text}>
                {KIND[k].label}
              </Txt>
              {pending(k) > 0 ? (
                <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: active ? '#fff' : KIND[k].color, alignItems: 'center', justifyContent: 'center' }}>
                  <Txt size={11} weight="800" color={active ? KIND[k].color : '#fff'}>
                    {pending(k)}
                  </Txt>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {list.length === 0 ? (
        <Txt color={C.sub} align="center" style={{ paddingVertical: 30 }}>
          Không có yêu cầu nào
        </Txt>
      ) : (
        list.map((r: ApprovalRequest) => (
          <Pressable key={r.id} onPress={() => setOpenId(r.id)}>
            <Card style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Txt size={11} weight="700" color={C.sub}>
                  {r.id}
                </Txt>
                <Badge label={STATUS[r.status].label} tone={STATUS[r.status].tone} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Txt size={16} weight="800">
                    {r.title}
                  </Txt>
                  <Txt size={12} color={C.sub} style={{ marginTop: 2 }}>
                    {r.creator} · {r.createdAt} · {r.lines.length} linh kiện
                  </Txt>
                </View>
                <ChevronRight size={20} color={C.sub} />
              </View>
              <Txt size={15} weight="800" color={C.primary}>
                {fmtVnd(r.lines.reduce((s, l) => s + lineTotal(l), 0))}
              </Txt>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const WIDTHS = [36, 190, 100, 110, 40, 80, 44, 96];

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
