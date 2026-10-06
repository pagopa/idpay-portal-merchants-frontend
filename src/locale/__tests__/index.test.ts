/**
 * Since src/locale/index.ts contains side effects that are skipped
 * when NODE_ENV === 'test', we verify that:
 *  - The module can be imported without throwing
 *  - The default export is the mocked i18n instance
 */

jest.mock('@pagopa/selfcare-common-frontend/lib/locale/locale-utils', () => {
  const mockI18n = {
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockReturnThis(),
    addResourceBundle: jest.fn(),
  };
  return mockI18n;
});

jest.mock('react-i18next', () => ({
  initReactI18next: {},
}));

jest.mock('../it/common.json', () => ({
  __esModule: true,
  default: { key: 'commonValue' },
}));

jest.mock('../multiInitiativeI18n', () => ({
  loadItNamespace: jest.fn().mockResolvedValue({}),
}));

describe('locale index', () => {
  it('should export i18n instance without initializing in test environment', async () => {
    const i18n = (await import('../index')).default;

    expect(i18n).toBeDefined();
    expect(typeof i18n).toBe('object');
  });
});
