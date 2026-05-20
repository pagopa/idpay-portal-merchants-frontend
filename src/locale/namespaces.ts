export type InitiativeDescriptor = {
  initiativeId: string;
  initiativeName: string;
};

export enum LocaleNamespace {
  Common = 'common',

  DefaultCopy = 'default/copy',

  DefaultConfig = 'default/config',

  InitiativeCopy = 'initiative/copy',

  InitiativeConfig = 'initiative/config',
}

export const initiativeNamespaceGenerator = (initiativesList: Array<InitiativeDescriptor>) =>
  initiativesList.map(({ initiativeName }) => initiativeName);

export const buildScopedNamespaces = (initiativeName?: string) => ({
  common: [LocaleNamespace.Common] as const,
  initiative: initiativeName ? ([`${initiativeName}/copy`, `${initiativeName}/config`] as const) : ([] as const),
  default: [LocaleNamespace.DefaultCopy, LocaleNamespace.DefaultConfig] as const,
});
