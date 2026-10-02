import { sanitizeAnalyticsPath } from '../analyticsPath';

describe('sanitizeAnalyticsPath', () => {
  it('removes dynamic detail route parameters but keeps the initiative id from known analytics routes', () => {
    expect(
      sanitizeAnalyticsPath(
        '/portale-esercenti/69e0fa95e21efa516c7b8dec/richieste-di-rimborso/7b198efa-3071-48b7-acb0-d166afb1b522'
      )
    ).toBe('/portale-esercenti/69e0fa95e21efa516c7b8dec/richieste-di-rimborso');
  });

  it('keeps the initiative id for routes composed only of the initiative id', () => {
    expect(sanitizeAnalyticsPath('/portale-esercenti/69e0fa95e21efa516c7b8dec/panoramica')).toBe(
      '/portale-esercenti/69e0fa95e21efa516c7b8dec/panoramica'
    );
  });

  it('keeps static routes unchanged', () => {
    expect(sanitizeAnalyticsPath('/portale-esercenti/privacy-policy')).toBe(
      '/portale-esercenti/privacy-policy'
    );
  });

  it('returns unknown paths unchanged', () => {
    expect(sanitizeAnalyticsPath('/portale-esercenti/custom-route/not-managed')).toBe(
      '/portale-esercenti/custom-route/not-managed'
    );
  });

  it('normalizes PUBLIC_URL set to root to an empty analytics base route', () => {
    const originalPublicUrl = process.env.PUBLIC_URL;
    process.env.PUBLIC_URL = '/';
    jest.resetModules();

    jest.isolateModules(() => {
      const { sanitizeAnalyticsPath: isolatedSanitizeAnalyticsPath } = require('../analyticsPath');

      expect(isolatedSanitizeAnalyticsPath('/auth')).toBe('/auth');
    });

    process.env.PUBLIC_URL = originalPublicUrl;
  });

  it('falls back to the preserved dynamic placeholder when the matched params are missing', () => {
    jest.resetModules();
    jest.doMock('react-router-dom', () => ({
      matchPath: jest.fn((_pathname, config) => {
        if (config?.path === '/portale-esercenti/:initiative_id/panoramica') {
          return { params: {} };
        }

        return false;
      }),
    }));

    jest.isolateModules(() => {
      const { sanitizeAnalyticsPath: isolatedSanitizeAnalyticsPath } = require('../analyticsPath');

      expect(isolatedSanitizeAnalyticsPath('/portale-esercenti/initiative-1/panoramica')).toBe(
        '/portale-esercenti/:initiative_id/panoramica'
      );
    });

    jest.dontMock('react-router-dom');
  });
});
