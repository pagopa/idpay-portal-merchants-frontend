/// <reference types="jest" />
import { loadItNamespace } from '../multiInitiativeI18n';

jest.mock('../it/common.json', () => ({
  __esModule: true,
  default: { key: 'commonValue' },
}));

jest.mock('../it/default/copy.json', () => ({
  __esModule: true,
  default: { key: 'defaultCopyValue' },
}));

jest.mock(
  '../it/testInitiative/copy.json',
  () => ({
    __esModule: true,
    default: { key: 'initiativeCopyValue' },
  }),
  { virtual: true }
);

describe('loadItNamespace', () => {
  it.each(['common', 'commons'])(
    'should load common namespace when namespace is "%s"',
    async (ns: string) => {
      const result = await loadItNamespace(ns);
      expect(result).toEqual({ key: 'commonValue' });
    }
  );

  it('should load default namespace file', async () => {
    const result = await loadItNamespace('default/copy');
    expect(result).toEqual({ key: 'defaultCopyValue' });
  });

  it('should load initiative-specific namespace file', async () => {
    const result = await loadItNamespace('testInitiative/copy');
    expect(result).toEqual({ key: 'initiativeCopyValue' });
  });

  it.each(['invalidnamespace', 'unknown/copy'])(
    'should return empty object for invalid or failing namespace "%s"',
    async (ns: string) => {
      const result = await loadItNamespace(ns);
      expect(result).toEqual({});
    }
  );
});
