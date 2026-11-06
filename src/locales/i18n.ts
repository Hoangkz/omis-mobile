import vi from './vi.json';

/**
 * Ứng dụng chỉ dùng tiếng Việt. Giữ API `t(key, params)` đơn giản để các nơi cũ
 * (toast, schema validate, form) vẫn lấy chuỗi từ một chỗ duy nhất: `vi.json`.
 */
type Dictionary = typeof vi;

type PathToDotNotation<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : T extends object
    ? {
        [K in keyof T]: K extends string
          ? PathToDotNotation<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
          : never;
      }[keyof T]
    : never;

export type TranslationKey = PathToDotNotation<Dictionary>;

function lookup(key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>((acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined), vi);
  return typeof value === 'string' ? value : key;
}

export const t = (key: TranslationKey, params?: Record<string, string | number>): string =>
  lookup(key).replace(/\{\{(\w+)\}\}/g, (_, name) => String(params?.[name] ?? ''));

export const LOCALE = 'vi';
