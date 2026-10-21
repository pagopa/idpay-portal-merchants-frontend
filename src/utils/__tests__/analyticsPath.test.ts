import { sanitizeAnalyticsPath } from '../analyticsPath';

describe('sanitizeAnalyticsPath', () => {
  it('removes dynamic detail route parameters and initiative ids from known analytics routes', () => {
    expect(
      sanitizeAnalyticsPath(
        '/portale-esercenti/69e0fa95e21efa516c7b8dec/richieste-di-rimborso/7b198efa-3071-48b7-acb0-d166afb1b522'
      )
    ).toBe('/portale-esercenti/richieste-di-rimborso');
  });

  it('removes the initiative id from initiative-scoped routes', () => {
    expect(sanitizeAnalyticsPath('/portale-esercenti/69e0fa95e21efa516c7b8dec/panoramica')).toBe(
      '/portale-esercenti/panoramica'
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

  it('normalizes PUBLIC_URL with multiple slashes and whitespace', () => {
    const originalPublicUrl = process.env.PUBLIC_URL;
    process.env.PUBLIC_URL = '  ///custom-base///  ';
    jest.resetModules();

    jest.isolateModules(() => {
      const { sanitizeAnalyticsPath: isolatedSanitizeAnalyticsPath } = require('../analyticsPath');

      expect(isolatedSanitizeAnalyticsPath('/custom-base/privacy-policy')).toBe('/custom-base/privacy-policy');
    });

    process.env.PUBLIC_URL = originalPublicUrl;
  });

  it('normalizes empty or blank PUBLIC_URL to default base route', () => {
    const originalPublicUrl = process.env.PUBLIC_URL;
    process.env.PUBLIC_URL = '   ';
    jest.resetModules();

    jest.isolateModules(() => {
      const { sanitizeAnalyticsPath: isolatedSanitizeAnalyticsPath } = require('../analyticsPath');

      expect(isolatedSanitizeAnalyticsPath('/portale-esercenti/privacy-policy')).toBe('/portale-esercenti/privacy-policy');
    });

    process.env.PUBLIC_URL = originalPublicUrl;
  });
});