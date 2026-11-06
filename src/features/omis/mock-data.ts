export type Role = 'admin' | 'sale';

export interface Sale {
  id: string;
  name: string;
  joined: string;
  tenure: string;
  position: string;
  region: string;
  focus: string;
  /** doanh thu theo tháng (T1..T12) */
  monthly: number[];
  /** mục tiêu doanh thu cả năm */
  kpiTarget: number;
}

const tr = (arr: number[]) => arr.map((v) => v * 1e6);

export const SALES: Sale[] = [
  {
    id: 's1', name: 'Nguyễn Văn A', joined: '15/03/2018', tenure: '8 năm', position: 'Trưởng phòng Kinh doanh',
    region: 'Toàn quốc', focus: 'Thiết bị gia dụng cao cấp',
    monthly: tr([210, 240, 260, 230, 280, 310, 295, 330, 350, 340, 0, 0]), kpiTarget: 4_000_000_000,
  },
  {
    id: 's2', name: 'Trần Thị B', joined: '10/05/2021', tenure: '5 năm', position: 'Trưởng nhóm Kinh doanh',
    region: 'Miền Bắc', focus: 'Điện thoại & Máy tính bảng',
    monthly: tr([150, 170, 160, 190, 200, 185, 210, 220, 215, 230, 0, 0]), kpiTarget: 2_800_000_000,
  },
  {
    id: 's3', name: 'Lê Hoàng C', joined: '22/09/2022', tenure: '4 năm', position: 'Chuyên viên Sales Logistics',
    region: 'Miền Nam', focus: 'Dịch vụ vận chuyển quốc tế',
    monthly: tr([120, 110, 140, 150, 135, 160, 170, 155, 180, 175, 0, 0]), kpiTarget: 2_000_000_000,
  },
  {
    id: 's4', name: 'Phạm Minh D', joined: '01/02/2024', tenure: '2 năm', position: 'Nhân viên Sales Thị trường',
    region: 'Miền Trung', focus: 'Hàng tiêu dùng nhanh (FMCG)',
    monthly: tr([60, 75, 80, 70, 95, 90, 100, 110, 105, 120, 0, 0]), kpiTarget: 1_200_000_000,
  },
  {
    id: 's5', name: 'Vũ Thu E', joined: '16/08/2025', tenure: '1 năm', position: 'Nhân viên Telesales',
    region: 'Tại văn phòng (Bán online)', focus: 'Khóa học tiếng Anh trực tuyến',
    monthly: tr([30, 40, 35, 50, 55, 60, 58, 70, 72, 80, 0, 0]), kpiTarget: 700_000_000,
  },
];

export const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

/** Doanh thu / công nợ toàn công ty theo tháng */
export const COMPANY_MONTHLY = MONTHS.map((_, i) => {
  const revenue = SALES.reduce((s, x) => s + x.monthly[i], 0);
  const paid = Math.round(revenue * (i < 8 ? 0.92 : i < 10 ? 0.7 : 0));
  return { revenue, paid, debt: revenue - paid };
});

export const CUSTOMERS = [
  'Công ty Quân HD',
  'Công ty A Huỳnh',
  'Siêu thị Hoa Mai',
  'Đại lý Minh Phát',
  'Cửa hàng Thanh Bình',
];

export interface Product {
  code: string;
  name: string;
  bom: string;
  price: number;
  /** chi phí vật tư theo đơn vị */
  materialCost: number;
}

export const PRODUCTS: Product[] = [
  { code: 'SP-001', name: 'Máy ion kiềm 3 tấm', bom: 'BOM-ION-3', price: 3_450_000, materialCost: 2_280_000 },
  { code: 'SP-002', name: 'Bộ lõi lọc Máy ion', bom: 'BOM-LOI-1', price: 1_750_000, materialCost: 1_100_000 },
  { code: 'SP-003', name: 'Hộp tạo kiềm 3 tấm', bom: 'BOM-HOP-3', price: 2_680_000, materialCost: 1_890_000 },
  { code: 'SP-004', name: 'Bộ nguồn điều khiển', bom: 'BOM-NGU-2', price: 980_000, materialCost: 540_000 },
];

export type OrderStatus = 'pending' | 'approved' | 'delivered';

export interface Order {
  id: string;
  date: string; // ISO yyyy-mm-dd
  customer: string;
  productCode: string;
  qty: number;
  delivered: number;
  saleId: string;
  paid: number;
  status: OrderStatus;
}

const seedOrders: Omit<Order, 'id'>[] = [
  { date: '2026-08-24', customer: CUSTOMERS[0], productCode: 'SP-001', qty: 20, delivered: 20, saleId: 's1', paid: 69_000_000, status: 'delivered' },
  { date: '2026-08-24', customer: CUSTOMERS[1], productCode: 'SP-002', qty: 20, delivered: 12, saleId: 's2', paid: 20_000_000, status: 'approved' },
  { date: '2026-08-26', customer: CUSTOMERS[1], productCode: 'SP-003', qty: 20, delivered: 0, saleId: 's2', paid: 0, status: 'approved' },
  { date: '2026-09-02', customer: CUSTOMERS[2], productCode: 'SP-001', qty: 35, delivered: 35, saleId: 's1', paid: 120_750_000, status: 'delivered' },
  { date: '2026-09-05', customer: CUSTOMERS[3], productCode: 'SP-004', qty: 50, delivered: 30, saleId: 's3', paid: 29_400_000, status: 'approved' },
  { date: '2026-09-11', customer: CUSTOMERS[4], productCode: 'SP-002', qty: 40, delivered: 0, saleId: 's4', paid: 0, status: 'pending' },
  { date: '2026-09-18', customer: CUSTOMERS[0], productCode: 'SP-003', qty: 15, delivered: 15, saleId: 's1', paid: 40_200_000, status: 'delivered' },
  { date: '2026-10-03', customer: CUSTOMERS[2], productCode: 'SP-004', qty: 60, delivered: 20, saleId: 's5', paid: 0, status: 'approved' },
  { date: '2026-10-09', customer: CUSTOMERS[3], productCode: 'SP-001', qty: 10, delivered: 0, saleId: 's1', paid: 0, status: 'pending' },
  { date: '2026-10-15', customer: CUSTOMERS[1], productCode: 'SP-002', qty: 25, delivered: 25, saleId: 's2', paid: 43_750_000, status: 'delivered' },
  { date: '2026-10-21', customer: CUSTOMERS[4], productCode: 'SP-003', qty: 30, delivered: 5, saleId: 's3', paid: 10_000_000, status: 'approved' },
  { date: '2026-11-02', customer: CUSTOMERS[0], productCode: 'SP-001', qty: 18, delivered: 0, saleId: 's1', paid: 0, status: 'pending' },
];

export const SEED_ORDERS: Order[] = seedOrders.map((o, i) => ({
  ...o,
  id: `DH-2026${o.date.slice(5, 7)}${o.date.slice(8, 10)}-${String(i + 1).padStart(3, '0')}`,
}));

export type RequestKind = 'buy' | 'edit';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface RequestLine {
  name: string;
  code: string;
  supplier: string;
  need: number;
  unitPrice: number;
  vat: number; // %
}

export interface ApprovalRequest {
  id: string;
  kind: RequestKind;
  title: string;
  createdAt: string;
  creator: string;
  status: RequestStatus;
  lines: RequestLine[];
  /** nội dung nhân viên yêu cầu sửa (với kind = 'edit') */
  editNote?: string;
  /** phản hồi của ông chủ */
  feedback?: string;
}

export const SEED_REQUESTS: ApprovalRequest[] = [
  {
    id: 'PR-2026-0001', kind: 'buy', title: 'Đơn mua 1', createdAt: '02/09/2026', creator: 'Nguyễn Văn Mạnh', status: 'pending',
    lines: [
      { name: 'Bộ hộp thép sơn tĩnh điện TBTK MIX RO', code: 'HTRO-MIX01', supplier: 'BBM / Thuận Phát', need: 20, unitPrice: 280_000, vat: 8 },
      { name: 'Mặt kính hộp TBTK MIX RO IONGEYSER 1', code: 'MKHK-00001', supplier: 'MICA An Phát', need: 20, unitPrice: 40_000, vat: 8 },
      { name: 'Núm volume nhôm ĐEN D34 2 vạch', code: 'NXDD-3401', supplier: 'SHOPPE', need: 15, unitPrice: 28_000, vat: 0 },
      { name: 'Alkaline Generation Module 3 plates', code: 'JIN204115-3I', supplier: 'CTY MLS', need: 10, unitPrice: 950_000, vat: 8 },
      { name: 'Dây bus 4P XH2.54 dây 22AWG 1 đầu cắm dài 30cm', code: '4PXH2.54-1D', supplier: 'LKCL', need: 17, unitPrice: 7_500, vat: 8 },
      { name: 'Gói 2 đầu NN dây 6', code: 'CUT-2DNND6', supplier: 'MediaTech', need: 35, unitPrice: 1_400, vat: 8 },
    ],
  },
  {
    id: 'PR-2026-0002', kind: 'edit', title: 'Đơn mua 2 (sửa nhà cung cấp)', createdAt: '05/09/2026', creator: 'Trần Thị B', status: 'pending',
    editNote: 'Đổi nhà cung cấp mica sang MICA Việt Nhật để giảm giá 5%.',
    lines: [
      { name: 'Mặt kính hộp TBTK MIX RO IONGEYSER 1', code: 'MKHK-00001', supplier: 'MICA Việt Nhật', need: 40, unitPrice: 38_000, vat: 8 },
      { name: 'Núm volume nhôm ĐEN D34 2 vạch', code: 'NXDD-3401', supplier: 'SHOPPE', need: 40, unitPrice: 27_000, vat: 0 },
    ],
  },
  {
    id: 'PR-2026-0003', kind: 'buy', title: 'Đơn mua 3', createdAt: '09/09/2026', creator: 'Lê Hoàng C', status: 'approved',
    lines: [{ name: 'Bộ nguồn 24V 5A', code: 'PSU-24V5A', supplier: 'CTY Điện Tử Việt', need: 30, unitPrice: 185_000, vat: 8 }],
  },
];

export function lineTotal(l: RequestLine) {
  return Math.round(l.need * l.unitPrice * (1 + l.vat / 100));
}

/** Chi phí / lợi nhuận / giá bán theo tháng cho từng mã hàng (mock) */
export function costByMonth(productCode: string) {
  const list = productCode === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.code === productCode);
  return MONTHS.slice(0, 10).map((m, i) => {
    let material = 0;
    let sell = 0;
    list.forEach((p, pi) => {
      const qty = 40 + ((i * 7 + pi * 13) % 35);
      const drift = 1 + (((i + pi) % 5) - 2) * 0.012; // biến động giá vật tư
      material += qty * p.materialCost * drift;
      sell += qty * p.price;
    });
    return { month: m, material: Math.round(material), profit: Math.round(sell - material), sell: Math.round(sell) };
  });
}
