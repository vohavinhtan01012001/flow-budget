import { useLocalStorage } from 'usehooks-ts';

import { STORAGE_KEYS } from '@/constants/shared.const';
import { ELanguageCode } from '@/models/enums/shared.enum';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useLocalStorage<ELanguageCode>(
    STORAGE_KEYS.LANGUAGE,
    ELanguageCode.English,
  );

  useEffect(() => {
    if (language && Object.values(ELanguageCode).includes(language))
      i18n.changeLanguage(language);
  }, [language, i18n]);

  return {
    language,
    setLanguage,
  };
};
