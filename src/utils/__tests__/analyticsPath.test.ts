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

  describe('PUBLIC_URL normalization', () => {
    const originalPublicUrl = process.env.PUBLIC_URL;

    afterEach(() => {
      process.env.PUBLIC_URL = originalPublicUrl;
    });

    it.each([
      {
        description: 'set to root',
        publicUrl: '/',
        inputPath: '/auth',
        expectedPath: '/auth',
      },
      {
        description: 'with multiple slashes and whitespace',
        publicUrl: '  ///custom-base///  ',
        inputPath: '/custom-base/privacy-policy',
        expectedPath: '/custom-base/privacy-policy',
      },
      {
        description: 'empty or blank',
        publicUrl: '   ',
        inputPath: '/portale-esercenti/privacy-policy',
        expectedPath: '/portale-esercenti/privacy-policy',
      },
    ])('normalizes PUBLIC_URL when $description', ({ publicUrl, inputPath, expectedPath }) => {
      process.env.PUBLIC_URL = publicUrl;
      jest.resetModules();

      jest.isolateModules(() => {
        const { sanitizeAnalyticsPath: isolatedSanitizeAnalyticsPath } = require('../analyticsPath');

        expect(isolatedSanitizeAnalyticsPath(inputPath)).toBe(expectedPath);
      });
    });
  });
});