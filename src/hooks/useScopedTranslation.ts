import { useTranslation } from "react-i18next";

export const useScopedTranslation = (baseKey: string) => {
  const { t } = useTranslation();

  return (key: string, options?: object) =>
    t(`${baseKey}.${key}`, options);
};
