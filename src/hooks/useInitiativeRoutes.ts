import { buildNamespaceKey } from "../utils/buildNamespaceKey";
import useScopedTranslation from "./useScopedTranslation";

export const useInitiativeRoutes = () => {
    const { t } = useScopedTranslation({ fileName: "config" });
    const getInitiativeRoutes = (initiativeName?: string, startDate?: string) => {
        const nameSpace = buildNamespaceKey(initiativeName ?? '', startDate ?? '');
        return t(`routes`, { returnObjects: true, nameSpace }) || [] as Array<string>;
    };
    return { getInitiativeRoutes };
};