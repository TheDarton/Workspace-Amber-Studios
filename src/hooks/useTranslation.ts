import { useAuth } from '../contexts/useAuth';
import { getTranslation, Language } from '../i18n/translations';

export function useTranslation() {
  const { language } = useAuth();

  const t = (key: string): string => {
    return getTranslation(language as Language, key);
  };

  return { t, language };
}
