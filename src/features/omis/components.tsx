import { getApiErrorMessage } from '@/src/lib/api-error';
import { fmtShort } from '@/src/lib/format';
import { useRouter } from 'expo-router';
import { ChevronDown, Check, UserRound, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from './theme';

/** Ép về số hữu hạn (BE có thể trả chuỗi/null/thiếu trường) */
const num = (v: unknown): number => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};
/** Tỉ lệ → chuỗi phần trăm hợp lệ 0–100% (không bao giờ NaN/Infinity) */
const pct = (part: unknown, total: unknown): `${number}%` => {
  const t = num(total);
  const v = t > 0 ? (num(part) / t) * 100 : 0;
  return `${Math.min(100, Math.max(0, v))}%`;
};

/* ------------------------------------------------------------------ */
/* Basics                                                              */
/* ------------------------------------------------------------------ */

type TxtProps = {
  children?: React.ReactNode;
  size?: number;
  weight?: TextStyle['fontWeight'];
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  align?: TextStyle['textAlign'];
};

export function Txt({ children, size = 14, weight = '400', color = C.text, style, numberOfLines, align }: TxtProps) {
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontSize: size, fontWeight: weight, color, textAlign: align }, style]}>
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          backgroundColor: C.card,
          borderRadius: 18,
          padding: 16,
          shadowColor: '#1E3A8A',
          shadowOpacity: 0.07,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <Txt size={15} weight="700">
        {children}
      </Txt>
      {right}
    </View>
  );
}

export function Badge({ label, tone }: { label: string; tone: 'green' | 'orange' | 'red' | 'blue' | 'gray' }) {
  const map = {
    green: [C.greenSoft, C.green],
    orange: [C.orangeSoft, '#B45309'],
    red: [C.redSoft, C.red],
    blue: [C.primarySoft, C.primary],
    gray: [C.line, C.sub],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Txt size={11} weight="700" color={fg}>
        {label}
      </Txt>
    </View>
  );
}

export function Btn({
  label,
  onPress,
  tone = 'primary',
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  tone?: 'primary' | 'danger' | 'success' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [pressed, setPressed] = useState(false);
  const bg = { primary: C.primary, danger: C.red, success: C.green, ghost: C.primarySoft }[tone];
  const fg = tone === 'ghost' ? C.primary : '#fff';
  // Lưu ý: không dùng style dạng hàm cho Pressable – NativeWind sẽ bỏ qua style.
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      style={[
        {
          backgroundColor: bg,
          borderRadius: 14,
          height: 48,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon}
      <Txt size={15} weight="700" color={fg}>
        {label}
      </Txt>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Screen scaffold                                                     */
/* ------------------------------------------------------------------ */

export function Screen({
  title,
  subtitle,
  right,
  children,
  scroll = true,
  onRefresh,
  refreshing = false,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  /** Kéo xuống để tải lại */
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const rightSlot = right ?? (
    <Pressable
      onPress={() => router.push('/settings')}
      hitSlop={10}
      accessibilityLabel="Tài khoản / Đăng xuất"
      style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
    >
      <UserRound size={20} color="#fff" />
    </Pressable>
  );
  const header = (
    <View
      style={{
        paddingTop: insets.top + 10,
        paddingHorizontal: 18,
        paddingBottom: 14,
        backgroundColor: C.primary,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1 }}>
        <Txt size={22} weight="800" color="#fff">
          {title}
        </Txt>
        {subtitle ? (
          <Txt size={12} color="#BFD0FA" style={{ marginTop: 2 }}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {rightSlot}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  secureTextEntry,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Txt size={12} weight="600" color={C.sub}>
          {label}
        </Txt>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA8C4"
        keyboardType={keyboardType}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
          height: multiline ? 90 : 46,
          textAlignVertical: multiline ? 'top' : 'center',
          fontSize: 15,
          color: C.text,
        }}
      />
    </View>
  );
}

export interface Option {
  value: string;
  label: string;
}

/** Dropdown dạng pill: bấm mở bottom sheet chọn 1 giá trị */
export function Picker({
  label,
  value,
  options,
  onChange,
  style,
  full,
}: {
  label?: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  style?: StyleProp<ViewStyle>;
  full?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          {
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 42,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            flex: full ? undefined : 1,
          },
          style,
        ]}
      >
        <View style={{ flex: 1 }}>
          {label ? (
            <Txt size={9} weight="600" color={C.sub} numberOfLines={1}>
              {label}
            </Txt>
          ) : null}
          <Txt size={13} weight="600" numberOfLines={1}>
            {current?.label ?? '—'}
          </Txt>
        </View>
        <ChevronDown size={16} color={C.sub} />
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label ?? 'Chọn'}>
        <ScrollView style={{ maxHeight: 380 }}>
          {options.map((o) => {
            const active = o.value === value;
            return (
              <Pressable
                key={o.value}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: C.line,
                }}
              >
                <Txt size={15} weight={active ? '700' : '400'} color={active ? C.primary : C.text}>
                  {o.label}
                </Txt>
                {active ? <Check size={18} color={C.primary} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </Sheet>
    </>
  );
}

export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(15,27,51,0.45)' }} onPress={onClose} />
      <View
        style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 18,
          paddingBottom: insets.bottom + 18,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Txt size={17} weight="800">
            {title}
          </Txt>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={C.sub} />
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* KPI tiles & charts                                                  */
/* ------------------------------------------------------------------ */

export function KpiTile({
  label,
  value,
  icon,
  tint = C.primary,
  soft = C.primarySoft,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tint?: string;
  soft?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        gap: 8,
        borderLeftWidth: 4,
        borderLeftColor: tint,
      }}
    >
      <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: soft, alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <Txt size={20} weight="800">
        {value}
      </Txt>
      <Txt size={11} color={C.sub} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
      {items.map((i) => (
        <View key={i.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: i.color }} />
          <Txt size={11} color={C.sub}>
            {i.label}
          </Txt>
        </View>
      ))}
    </View>
  );
}

/** Biểu đồ cột nhóm. Mỗi group có nhiều giá trị (series). */
export function ColumnChart({
  groups,
  colors,
  height = 150,
  onPressGroup,
  format = fmtShort,
}: {
  groups: { label: string; values: number[] }[];
  colors: string[];
  height?: number;
  onPressGroup?: (index: number) => void;
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...groups.flatMap((g) => g.values.map(num)));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, minWidth: '100%' }}>
        {groups.map((g, gi) => (
          <Pressable key={g.label} onPress={() => onPressGroup?.(gi)} style={{ alignItems: 'center', flexGrow: 1 }}>
            <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 3 }}>
              {g.values.map((v, vi) => (
                <View key={vi} style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                  {v > 0 && groups.length <= 6 ? (
                    <Txt size={9} color={C.sub} style={{ marginBottom: 2 }}>
                      {format(v)}
                    </Txt>
                  ) : null}
                  <View
                    style={{
                      width: groups.length <= 6 ? 26 : 10,
                      height: Math.max(num(v) > 0 ? 3 : 0, (num(v) / max) * (height - 16)),
                      backgroundColor: colors[vi % colors.length],
                      borderTopLeftRadius: 5,
                      borderTopRightRadius: 5,
                    }}
                  />
                </View>
              ))}
            </View>
            <Txt size={10} color={C.sub} style={{ marginTop: 6 }}>
              {g.label}
            </Txt>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

export function Donut({
  parts,
  size = 150,
  centerTop,
  centerBottom,
}: {
  parts: { value: number; color: string }[];
  size?: number;
  centerTop?: string;
  centerBottom?: string;
}) {
  const stroke = 20;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const total = parts.reduce((s, p) => s + num(p.value), 0) || 1;
  // độ dài & điểm bắt đầu của từng cung (tính trước, không gán lại biến khi render)
  const arcs = parts.map((p, i) => ({
    ...p,
    len: (num(p.value) / total) * circ,
    start: (parts.slice(0, i).reduce((s, q) => s + num(q.value), 0) / total) * circ,
  }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.line} strokeWidth={stroke} fill="none" />
        {arcs.map((a, i) => (
          <Circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={a.color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${a.len} ${circ - a.len}`}
            strokeDashoffset={-a.start}
          />
        ))}
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Txt size={22} weight="800">
          {centerTop}
        </Txt>
        <Txt size={11} color={C.sub}>
          {centerBottom}
        </Txt>
      </View>
    </View>
  );
}

/** Thanh ngang: label | bar | value */
export function HBars({
  rows,
  format = fmtShort,
  onPressRow,
  activeIndex,
}: {
  rows: { label: string; value: number; color: string }[];
  format?: (n: number) => string;
  onPressRow?: (i: number) => void;
  activeIndex?: number;
}) {
  const max = Math.max(1, ...rows.map((r) => num(r.value)));
  return (
    <View style={{ gap: 12 }}>
      {rows.map((r, i) => (
        <Pressable
          key={r.label}
          onPress={() => onPressRow?.(i)}
          style={{ opacity: activeIndex === undefined || activeIndex === i ? 1 : 0.4 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Txt size={12} weight="600">
              {r.label}
            </Txt>
            <Txt size={12} weight="700" color={C.sub}>
              {format(num(r.value))}
            </Txt>
          </View>
          <View style={{ height: 12, backgroundColor: C.line, borderRadius: 6, overflow: 'hidden' }}>
            <View style={{ width: pct(r.value, max), height: '100%', backgroundColor: r.color, borderRadius: 6 }} />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

/** Thanh xếp chồng 100%: vd giá vốn + lợi nhuận = doanh thu */
export function StackedRows({
  rows,
  colors,
}: {
  rows: { label: string; parts: number[]; total: number }[];
  colors: string[];
}) {
  return (
    <View style={{ gap: 9 }}>
      {rows.map((r, idx) => (
        <View key={`${r.label}-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Txt size={11} color={C.sub} style={{ width: 28 }}>
            {String(r.label ?? '')}
          </Txt>
          <View style={{ flex: 1, height: 18, flexDirection: 'row', borderRadius: 6, overflow: 'hidden', backgroundColor: C.line }}>
            {r.parts.map((p, i) => (
              <View key={i} style={{ width: pct(p, r.total), backgroundColor: colors[i] }} />
            ))}
          </View>
          <Txt size={11} weight="700" style={{ width: 52 }} align="right">
            {fmtShort(num(r.total))}
          </Txt>
        </View>
      ))}
    </View>
  );
}

export function Progress({ value, color = C.primary }: { value: number; color?: string }) {
  return (
    <View style={{ height: 10, backgroundColor: C.line, borderRadius: 5, overflow: 'hidden' }}>
      <View style={{ width: pct(value, 1), height: '100%', backgroundColor: color, borderRadius: 5 }} />
    </View>
  );
}

export function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Txt size={13} color={C.sub}>
        {label}
      </Txt>
      <Txt size={13} weight={bold ? '800' : '600'}>
        {value}
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Trạng thái tải dữ liệu                                              */
/* ------------------------------------------------------------------ */

/** Hiện spinner khi đang tải lần đầu, hoặc khối lỗi + nút thử lại. Không có gì để hiện thì trả null. */
export function QueryState({
  loading,
  error,
  onRetry,
}: {
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}) {
  if (error) {
    return (
      <Card style={{ backgroundColor: C.redSoft, gap: 10 }}>
        <Txt size={13} weight="600" color={C.red}>
          {getApiErrorMessage(error)}
        </Txt>
        {onRetry ? <Btn tone="danger" label="Thử lại" onPress={onRetry} style={{ height: 40 }} /> : null}
      </Card>
    );
  }
  if (loading) {
    return (
      <View style={{ paddingVertical: 24, alignItems: 'center' }}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }
  return null;
}
