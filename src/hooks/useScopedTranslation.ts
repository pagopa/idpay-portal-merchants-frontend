import { useTranslation } from "react-i18next";
import type { TOptions } from "i18next";

export const useScopedTranslation = (baseKey: string) => {
  const { t } = useTranslation();

  return (key: string, options?: TOptions) =>
    t(`${baseKey}.${key}`, options);
};
