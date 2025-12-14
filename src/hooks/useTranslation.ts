import { getTranslation } from '../i18n/translations';

export function useTranslation() {
  const t = (key: string): string => {
    return getTranslation('en', key);
  };

  return { t };
}
