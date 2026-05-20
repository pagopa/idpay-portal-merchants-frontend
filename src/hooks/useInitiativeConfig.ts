import { buildNamespaceKey } from "../utils/buildNamespaceKey";
import useScopedTranslation from "./useScopedTranslation";

export function useInitiativeConfig<T>(config: string, namespace?: {initiativeName: string, startDate: string}) {
    const { t } = useScopedTranslation({ fileName: "config", ...(namespace ? {initiativeName: buildNamespaceKey(namespace.initiativeName ?? '', namespace.startDate ?? '')} : {})});
    const initiativeConfig = t(config, { returnObjects: true }) as T;
    return { initiativeConfig };
};