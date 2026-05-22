
import { useCallback } from 'react';
import { buildNamespaceKey } from '../utils/buildNamespaceKey';
import { InitiativeDTO } from '../api/generated/merchants/data-contracts';
import config from '../locale/it/default/config.json';

export function useInitiativeConfig<T>() {

    const getConfig = useCallback(async (key: keyof typeof config, initiative: InitiativeDTO) => {
        const initiativeName = buildNamespaceKey(initiative?.initiativeName || '', initiative?.startDate || '');
        try {
            const mod = await import(`../locale/it/${initiativeName}/config.json`);
            return mod.default?.[key] as T;
        } catch {
            return config?.[key] as T;
        }

    }, []);

    return { getConfig };
};
