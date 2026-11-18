import { ENV } from '../utils/env';

const initiativeResources = [
  {
    initiativeId: ENV.INITIATIVE_IDS?.BONUS_ELETTRODOMESTICI,
    folder: 'bonusElettrodomestici2025',
  },
  {
    initiativeId: ENV.INITIATIVE_IDS?.BONUS_DECODER,
    folder: 'bonusDecoder2026',
  },
];

export const getInitiativeResourceFolder = (initiativeId?: string): string | undefined => {
  if (!initiativeId) {
    return undefined;
  }

  return initiativeResources.find((resource) => resource.initiativeId === initiativeId)?.folder;
};
