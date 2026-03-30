import { useTranslation } from "react-i18next";
import type { TOptionsBase } from "i18next";

type ScopedT = {
  (key: string, options?: TOptionsBase): string;
  (key: string, defaultValue: string, options?: TOptionsBase): string;
};

export const useScopedTranslation = (baseKey: string): ScopedT => {
  const { t } = useTranslation();

  return ((key: string, defaultValueOrOptions?: string | TOptionsBase, maybeOptions?: TOptionsBase) => {
    const fullKey = `${baseKey}.${key}` as const;

    if (typeof defaultValueOrOptions !== "string") {
      return t(fullKey, defaultValueOrOptions as any);
    }

    return t(fullKey, defaultValueOrOptions, maybeOptions as any);
  }) as ScopedT;
};
