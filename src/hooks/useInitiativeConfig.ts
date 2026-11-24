import { useCallback } from 'react';
import { InitiativeDTO } from '../api/generated/merchants/data-contracts';
import config from '../locale/it/default/config.json';
import { getInitiativeResourceFolder } from '../locale/initiativeResources';

export function useInitiativeConfig<T>() {
  const defaultConfig = config;
  const getConfig = useCallback(async (key: keyof typeof config, initiative?: InitiativeDTO) => {
    const initiativeFolder = getInitiativeResourceFolder(initiative?.initiativeId);
    if (!initiativeFolder) {
      return config?.[key] as T;
    }

    try {
      const mod = await import(`../locale/it/${initiativeFolder}/config.json`);
      return (mod.default?.[key] ?? config[key]) as T;
    } catch {
      return config?.[key] as T;
    }
  }, []);

  return { getConfig, defaultConfig };
}
