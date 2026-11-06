import { t } from '@/src/locales/i18n';

/** Chỉ còn tiếng Việt – hook giữ lại để code cũ gọi `const { t } = useTranslation()` vẫn chạy. */
export const useTranslation = () => ({ t });
