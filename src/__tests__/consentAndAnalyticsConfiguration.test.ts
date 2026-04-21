jest.mock('@pagopa/selfcare-common-frontend/lib/config/env', () => ({
  CONFIG: {
    ANALYTCS: {
      ENABLE: false,
      MOCK: false,
      DEBUG: false,
      TOKEN: '',
      API_HOST: '',
      ADDITIONAL_PROPERTIES_IMPORTANT: {},
    },
  },
}));

jest.mock('../utils/env', () => ({
  ENV: {
    ANALYTCS: {
      ENABLE: true,
      MOCK: true,
      DEBUG: true,
      TOKEN: 'test-token',
      API_HOST: 'http://api.test',
    },
    ENV: 'test',
  },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/consentManagementConfigure', () => ({}));

describe('consentAndAnalyticsConfiguration', () => {
  it('should configure ANALYTCS values from ENV', async () => {
    await import('../consentAndAnalyticsConfiguration');

    const { CONFIG } = await import('@pagopa/selfcare-common-frontend/config/env');

    expect(CONFIG.ANALYTCS.ENABLE).toBe(true);
    expect(CONFIG.ANALYTCS.MOCK).toBe(true);
    expect(CONFIG.ANALYTCS.DEBUG).toBe(true);
    expect(CONFIG.ANALYTCS.TOKEN).toBe('test-token');
    expect(CONFIG.ANALYTCS.API_HOST).toBe('http://api.test');
    expect(CONFIG.ANALYTCS.ADDITIONAL_PROPERTIES_IMPORTANT).toEqual({
      env: 'test',
    });
  });
});
