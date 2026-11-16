import axios from 'axios';

/** Mã lỗi (key) của BE → câu tiếng Việt cho người dùng */
const MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'Sai tên đăng nhập hoặc mật khẩu',
  AUTH_INVALID_ACCESS_TOKEN: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  AUTH_INVALID_REFRESH_TOKEN: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  AUTH_INVALID_LOGIN_TOKEN: 'Mã QR đã hết hạn hoặc đã được sử dụng. Vui lòng tạo mã mới trên máy tính.',
  AUTH_INVALID_SESSION: 'Thông tin xác thực không hợp lệ. Vui lòng đăng nhập lại hoặc quét lại mã QR.',
  COMMON_FORBIDDEN_ROLE: 'Bạn không có quyền thực hiện thao tác này',
  ORDERS_PRODUCT_NOT_FOUND: 'Sản phẩm không tồn tại',
  ORDERS_SALESPERSON_NOT_FOUND: 'Nhân viên sale không tồn tại',
  ORDERS_SALESPERSON_SELF_ONLY: 'Bạn chỉ được tạo đơn cho chính mình',
  ORDERS_ORDER_CODE_EXISTS: 'Mã đơn hàng đã tồn tại',
  PURCHASE_REQUESTS_NOT_FOUND: 'Yêu cầu mua hàng không tồn tại',
  PURCHASE_REQUESTS_ALREADY_DECIDED: 'Yêu cầu này đã được xử lý trước đó',
};

/** Lấy câu thông báo thân thiện từ lỗi axios / lỗi thường */
export function getApiErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng.';
    const key = (error.response.data as { message?: unknown } | undefined)?.message;
    if (typeof key === 'string') return MESSAGES[key] ?? (/^[A-Z0-9_]+$/.test(key) ? fallback : key);
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
