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
  it('should load common namespace when namespace is "common"', async () => {
    const result = await loadItNamespace('common');
    expect(result).toEqual({ key: 'commonValue' });
  });

  it('should load common namespace when namespace is "commons"', async () => {
    const result = await loadItNamespace('commons');
    expect(result).toEqual({ key: 'commonValue' });
  });

  it('should load default namespace file', async () => {
    const result = await loadItNamespace('default/copy');
    expect(result).toEqual({ key: 'defaultCopyValue' });
  });

  it('should load initiative-specific namespace file', async () => {
    const result = await loadItNamespace('testInitiative/copy');
    expect(result).toEqual({ key: 'initiativeCopyValue' });
  });

  it('should return empty object if namespace format is invalid', async () => {
    const result = await loadItNamespace('invalidnamespace');
    expect(result).toEqual({});
  });

  it('should return empty object if import fails', async () => {
    const result = await loadItNamespace('unknown/copy');
    expect(result).toEqual({});
  });
});
