const BONUS_ELETTRODOMESTICI_NAMESPACE = 'bonuselettrodomestici';

export const getInitiativeProductLabel = (initiativeNamespace?: string): string => {
  const normalizedNamespace = initiativeNamespace?.toLowerCase() ?? '';

  if (normalizedNamespace.includes(BONUS_ELETTRODOMESTICI_NAMESPACE)) {
    return 'Elettrodomestico';
  }

  return 'Prodotto';
};

