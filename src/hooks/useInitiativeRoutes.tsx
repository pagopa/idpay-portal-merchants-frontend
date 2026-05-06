import { useTranslation } from "react-i18next";

export const useInitiativeRoutes = () => {
    const {t} = useTranslation();
    const getInitiativeRoutes = (initiativeName?: string) => t(`${initiativeName ?? "common"}.routes`, { returnObjects: true }) as Array<string>;
    return {getInitiativeRoutes};
};