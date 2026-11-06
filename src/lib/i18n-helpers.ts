import { t, TranslationKey } from '../locales/i18n';

/** Lấy thông báo validate (hỗ trợ tham số {{name}}). */
export const getValidationMessage = (
  key: TranslationKey,
  params?: Record<string, string | number>,
): string => t(key, params);
