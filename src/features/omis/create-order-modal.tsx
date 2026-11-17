import type { CreateOrderInput, Product, SalesOption } from '@/src/features/omis/api';
import { Btn, Field, Picker, Txt } from '@/src/features/omis/components';
import { C } from '@/src/features/omis/theme';
import { getApiErrorMessage } from '@/src/lib/api-error';
import { fmtNum, fmtVnd } from '@/src/lib/format';
import { Check, ChevronLeft, Minus, PackagePlus, Plus, Search, Trash2, X } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Line {
  product: Product;
  qty: string;
  /** Đơn giá nhập tay (chữ số); gợi ý sẵn từ giá SP hoặc lần bán gần nhất */
  price: string;
  /** VAT theo % (như web: mặc định 0, gửi BE dạng phân số) */
  vat: string;
}

const toQty = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0;
const toPrice = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0;
const lineAmount = (l: Line) => toQty(l.qty) * toPrice(l.price);
const toVatPct = (s: string) => Math.min(100, parseFloat(s.replace(',', '.')) || 0);
const lineVat = (l: Line) => lineAmount(l) * (toVatPct(l.vat) / 100);
const DATE_FMT = 'YYYY-MM-DD';

/** Ô chọn ngày (yyyy-mm-dd): Android mở hộp thoại, iOS dùng chip gọn của hệ thống */
function DateField({ label, value, onChange, clearable }: { label: string; value: string; onChange: (v: string) => void; clearable?: boolean }) {
  const date = value ? dayjs(value, DATE_FMT).toDate() : new Date();
  const pick = () =>
    DateTimePickerAndroid.open({
      value: date,
      mode: 'date',
      onChange: (e, d) => {
        if (e.type === 'set' && d) onChange(dayjs(d).format(DATE_FMT));
      },
    });
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Txt size={12} weight="600" color={C.sub}>
        {label}
      </Txt>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 46,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 12,
          paddingHorizontal: 12,
        }}
      >
        {Platform.OS === 'android' ? (
          <Pressable onPress={pick} style={{ flex: 1, height: 46, justifyContent: 'center' }}>
            <Txt size={15} color={value ? C.text : '#9AA8C4'}>
              {value ? dayjs(value, DATE_FMT).format('DD/MM/YYYY') : 'Chọn ngày'}
            </Txt>
          </Pressable>
        ) : (
          <DateTimePicker value={date} mode="date" display="compact" onChange={(_, d) => d && onChange(dayjs(d).format(DATE_FMT))} />
        )}
        {clearable && value ? (
          <Pressable onPress={() => onChange('')} hitSlop={8}>
            <X size={16} color={C.sub} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** Ô nhập tiền: lúc gõ hiện số thô (không đổi con trỏ), rời ô mới hiện dạng 1.234.567 */
function PriceInput({ value, onChange, invalid }: { value: string; onChange: (digits: string) => void; invalid?: boolean }) {
  const [focused, setFocused] = useState(false);
  const shown = focused ? value : value ? fmtNum(toPrice(value)) : '';
  return (
    <TextInput
      value={shown}
      onChangeText={(v) => onChange(v.replace(/\D/g, ''))}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      keyboardType="number-pad"
      placeholder="Nhập đơn giá"
      placeholderTextColor="#9AA8C4"
      style={{
        flex: 1,
        height: 38,
        textAlign: 'right',
        fontSize: 15,
        fontWeight: '700',
        color: C.text,
        borderWidth: 1,
        borderColor: invalid ? C.orange : C.line,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 0,
      }}
    />
  );
}

/** Nút tròn nhỏ dùng cho stepper */
function RoundBtn({ children, onPress, disabled }: { children: React.ReactNode; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: C.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </Pressable>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Txt size={strong ? 14 : 12} weight={strong ? '800' : '400'} color={strong ? C.text : C.sub}>
        {label}
      </Txt>
      <Txt size={strong ? 18 : 13} weight={strong ? '800' : '600'} color={strong ? C.primary : C.text}>
        {value}
      </Txt>
    </View>
  );
}

/** Tạo đơn hàng: nhiều sản phẩm, mỗi dòng có bước nhảy số lượng; chân trang luôn hiện tổng tiền. */
function CreateOrderForm({
  onClose,
  products,
  lastPrices,
  isAdmin,
  sales,
  submitting,
  onSubmit,
}: {
  onClose: () => void;
  products: Product[];
  /** productId → đơn giá của lần bán gần nhất (BE không lưu giá bán trên sản phẩm) */
  lastPrices: Record<number, number>;
  isAdmin: boolean;
  sales: SalesOption[];
  submitting: boolean;
  onSubmit: (input: Omit<CreateOrderInput, 'salespersonId'> & { salespersonId?: string }) => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'form' | 'pick'>('form');
  const [orderCode, setOrderCode] = useState('');
  const [orderDate, setOrderDate] = useState(dayjs().format(DATE_FMT));
  const [deadline, setDeadline] = useState('');
  const [customer, setCustomer] = useState('');
  const [sale, setSale] = useState('none');
  const [lines, setLines] = useState<Line[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');


  const selectedIds = useMemo(() => new Set(lines.map((l) => l.product.id)), [lines]);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return products;
    return products.filter((p) => p.name.toLowerCase().includes(kw) || (p.code ?? '').toLowerCase().includes(kw));
  }, [products, search]);

  const subtotal = lines.reduce((s, l) => s + lineAmount(l), 0);
  const vat = lines.reduce((s, l) => s + lineVat(l), 0);
  const noPrice = lines.filter((l) => toPrice(l.price) <= 0);
  const totalQty = lines.reduce((s, l) => s + toQty(l.qty), 0);

  const toggleProduct = (p: Product) => {
    setError('');
    setLines((cur) => (cur.some((l) => l.product.id === p.id) ? cur.filter((l) => l.product.id !== p.id) : [...cur, { product: p, qty: '1', price: String(p.unitPrice || lastPrices[p.id] || ''), vat: '0' }]));
  };
  const setPrice = (id: number, price: string) => setLines((cur) => cur.map((l) => (l.product.id === id ? { ...l, price: price.replace(/\D/g, '') } : l)));
  const setVat = (id: number, vat: string) => setLines((cur) => cur.map((l) => (l.product.id === id ? { ...l, vat: vat.replace(/[^\d.,]/g, '') } : l)));
  const setQty = (id: number, qty: string) => setLines((cur) => cur.map((l) => (l.product.id === id ? { ...l, qty } : l)));
  const stepQty = (id: number, delta: number) =>
    setLines((cur) => cur.map((l) => (l.product.id === id ? { ...l, qty: String(Math.max(1, toQty(l.qty) + delta)) } : l)));
  const removeLine = (id: number) => setLines((cur) => cur.filter((l) => l.product.id !== id));

  const submit = async () => {
    if (lines.length === 0) return setError('Vui lòng chọn ít nhất 1 sản phẩm');
    // Như web: báo rõ DÒNG nào sai khi đơn có nhiều dòng
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const bad = toQty(l.qty) < 1 ? 'Số lượng phải lớn hơn 0' : toPrice(l.price) <= 0 ? 'Đơn giá phải lớn hơn 0' : '';
      if (bad) return setError(lines.length > 1 ? `Dòng ${i + 1} (${l.product.name}): ${bad}` : bad);
    }
    setError('');
    try {
      await onSubmit({
        orderCode: orderCode.trim() || undefined,
        customerName: customer.trim() || undefined,
        orderDate,
        paymentDeadline: deadline || undefined,
        salespersonId: isAdmin ? (sale === 'none' ? undefined : sale) : undefined,
        items: lines.map((l) => ({
          productId: l.product.id,
          quantity: toQty(l.qty),
          unitPrice: toPrice(l.price),
          vatRate: Number((toVatPct(l.vat) / 100).toFixed(4)),
        })),
      });
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const header = (title: string, left: 'close' | 'back') => (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 12,
        paddingBottom: 12,
        backgroundColor: C.primary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Pressable
        onPress={left === 'back' ? () => setStep('form') : onClose}
        hitSlop={10}
        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
      >
        {left === 'back' ? <ChevronLeft size={22} color="#fff" /> : <X size={20} color="#fff" />}
      </Pressable>
      <Txt size={18} weight="800" color="#fff" style={{ flex: 1 }}>
        {title}
      </Txt>
    </View>
  );

  return (
    <Modal visible animationType="slide" onRequestClose={() => (step === 'pick' ? setStep('form') : onClose())}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {step === 'pick' ? (
          <>
            {header('Chọn sản phẩm', 'back')}
            <View style={{ padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: C.bg,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  height: 42,
                }}
              >
                <Search size={18} color={C.sub} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Tìm theo tên hoặc mã sản phẩm"
                  placeholderTextColor="#9AA8C4"
                  style={{ flex: 1, fontSize: 14, color: C.text }}
                />
                {search ? (
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <X size={16} color={C.sub} />
                  </Pressable>
                ) : null}
              </View>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 12, gap: 8 }}>
              {filtered.length === 0 ? (
                <Txt color={C.sub} align="center" style={{ paddingVertical: 24 }}>
                  Không tìm thấy sản phẩm
                </Txt>
              ) : (
                filtered.map((p) => {
                  const on = selectedIds.has(p.id);
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => toggleProduct(p)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        backgroundColor: '#fff',
                        borderRadius: 14,
                        padding: 12,
                        borderWidth: 1.5,
                        borderColor: on ? C.primary : C.line,
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 7,
                          borderWidth: 2,
                          borderColor: on ? C.primary : '#C5D0E6',
                          backgroundColor: on ? C.primary : '#fff',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {on ? <Check size={15} color="#fff" strokeWidth={3} /> : null}
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt size={14} weight="700" numberOfLines={2}>
                          {p.name}
                        </Txt>
                        <Txt size={11} color={C.sub} numberOfLines={1}>
                          {[p.code, p.unit].filter(Boolean).join(' · ') || 'Sản phẩm'}
                        </Txt>
                      </View>
                      <Txt size={13} weight="800" color={C.primary}>
                        {p.unitPrice || lastPrices[p.id] ? fmtVnd(p.unitPrice || lastPrices[p.id]) : ''}
                      </Txt>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
            <View style={{ padding: 12, paddingBottom: insets.bottom + 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line }}>
              <Btn
                label={lines.length ? `Xong · đã chọn ${lines.length} sản phẩm` : 'Xong'}
                onPress={() => setStep('form')}
              />
            </View>
          </>
        ) : (
          <>
            {header('Tạo đơn hàng', 'close')}
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}>
              <Field label="Mã đơn" value={orderCode} onChangeText={setOrderCode} placeholder="Để trống để hệ thống tự sinh" />
              <Field label="Khách hàng" value={customer} onChangeText={setCustomer} placeholder="Tên khách hàng" />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <DateField label="Ngày đặt" value={orderDate} onChange={setOrderDate} />
                <DateField label="Hạn thanh toán" value={deadline} onChange={setDeadline} clearable />
              </View>
              {isAdmin ? (
                <Picker
                  full
                  label="Nhân viên kinh doanh"
                  value={sale}
                  onChange={setSale}
                  options={[{ value: 'none', label: 'Chưa gán' }, ...sales.map((s) => ({ value: s.id, label: s.fullName || s.userName }))]}
                />
              ) : null}

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Txt size={15} weight="800">
                  Sản phẩm{lines.length ? ` (${lines.length})` : ''}
                </Txt>
                {lines.length > 0 ? (
                  <Pressable
                    onPress={() => setStep('pick')}
                    hitSlop={8}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primarySoft, paddingHorizontal: 12, height: 32, borderRadius: 16 }}
                  >
                    <Plus size={16} color={C.primary} />
                    <Txt size={13} weight="700" color={C.primary}>
                      Thêm
                    </Txt>
                  </Pressable>
                ) : null}
              </View>

              {lines.length === 0 ? (
                <Pressable
                  onPress={() => setStep('pick')}
                  style={{
                    alignItems: 'center',
                    gap: 8,
                    paddingVertical: 28,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                    borderColor: C.primary,
                    backgroundColor: C.primarySoft,
                  }}
                >
                  <PackagePlus size={30} color={C.primary} />
                  <Txt size={14} weight="700" color={C.primary}>
                    Chọn sản phẩm
                  </Txt>
                  <Txt size={12} color={C.sub}>
                    Có thể chọn nhiều sản phẩm cho một đơn
                  </Txt>
                </Pressable>
              ) : (
                lines.map((l) => (
                  <View key={l.product.id} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 12, gap: 10, borderWidth: 1, borderColor: C.line }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt size={14} weight="700" numberOfLines={2}>
                          {l.product.name}
                        </Txt>
                        <Txt size={11} color={C.sub}>
                          {[l.product.code, l.product.unit].filter(Boolean).join(' · ') || 'Sản phẩm'}
                        </Txt>
                      </View>
                      <Pressable onPress={() => removeLine(l.product.id)} hitSlop={10} accessibilityLabel="Xoá sản phẩm">
                        <Trash2 size={18} color={C.red} />
                      </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Txt size={12} weight="600" color={C.sub}>
                        Đơn giá
                      </Txt>
                      <PriceInput value={l.price} onChange={(v) => setPrice(l.product.id, v)} invalid={toPrice(l.price) <= 0} />
                      <Txt size={12} color={C.sub}>
                        ₫
                      </Txt>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Txt size={12} weight="600" color={C.sub}>
                        VAT
                      </Txt>
                      <TextInput
                        value={l.vat}
                        onChangeText={(v) => setVat(l.product.id, v)}
                        keyboardType="decimal-pad"
                        style={{
                          width: 56,
                          height: 34,
                          textAlign: 'center',
                          fontSize: 14,
                          fontWeight: '700',
                          color: C.text,
                          borderWidth: 1,
                          borderColor: C.line,
                          borderRadius: 10,
                          paddingVertical: 0,
                        }}
                      />
                      <Txt size={12} color={C.sub}>
                        %
                      </Txt>
                      <Txt size={11} color={C.sub} style={{ flex: 1, textAlign: 'right' }}>
                        {toPrice(l.price) > 0 ? `Giá có VAT: ${fmtVnd(Math.round(toPrice(l.price) * (1 + toVatPct(l.vat) / 100)))}` : ''}
                      </Txt>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <RoundBtn onPress={() => stepQty(l.product.id, -1)} disabled={toQty(l.qty) <= 1}>
                          <Minus size={16} color={C.primary} />
                        </RoundBtn>
                        <TextInput
                          value={l.qty}
                          onChangeText={(v) => setQty(l.product.id, v.replace(/\D/g, ''))}
                          onBlur={() => toQty(l.qty) <= 0 && setQty(l.product.id, '1')}
                          keyboardType="number-pad"
                          style={{
                            width: 56,
                            height: 38,
                            textAlign: 'center',
                            fontSize: 16,
                            fontWeight: '700',
                            color: C.text,
                            borderWidth: 1,
                            borderColor: C.line,
                            borderRadius: 10,
                            paddingVertical: 0,
                          }}
                        />
                        <RoundBtn onPress={() => stepQty(l.product.id, 1)}>
                          <Plus size={16} color={C.primary} />
                        </RoundBtn>
                      </View>
                      <Txt size={15} weight="800">
                        {fmtVnd(lineAmount(l))}
                      </Txt>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <View
              style={{
                padding: 14,
                paddingBottom: insets.bottom + 12,
                gap: 6,
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderTopColor: C.line,
              }}
            >
              <SummaryRow label={`Tạm tính · ${fmtNum(totalQty)} sản phẩm`} value={fmtVnd(subtotal)} />
              <SummaryRow label="VAT" value={fmtVnd(vat)} />
              <SummaryRow label="Tổng cộng" value={fmtVnd(subtotal + vat)} strong />
              {noPrice.length > 0 ? (
                <Txt size={12} color={C.orange ?? C.red}>
                  Còn {noPrice.length} sản phẩm chưa nhập đơn giá
                </Txt>
              ) : null}
              {error ? (
                <Txt size={12} color={C.red}>
                  {error}
                </Txt>
              ) : null}
              <Btn
                label={submitting ? 'Đang tạo…' : `Tạo đơn${lines.length ? ` (${lines.length} sản phẩm)` : ''}`}
                onPress={submit}
                disabled={submitting}
                style={{ marginTop: 4 }}
              />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Chỉ mount form khi mở → mỗi lần mở là một form trống (không cần reset state bằng effect) */
export function CreateOrderModal({ visible, ...props }: { visible: boolean } & React.ComponentProps<typeof CreateOrderForm>) {
  return visible ? <CreateOrderForm {...props} /> : null;
}
