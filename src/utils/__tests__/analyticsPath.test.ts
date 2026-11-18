import { sanitizeAnalyticsPath } from '../analyticsPath';

describe('sanitizeAnalyticsPath', () => {
  it('masks dynamic detail route parameters and initiative ids on known analytics routes', () => {
    expect(
      sanitizeAnalyticsPath(
        '/portale-esercenti/69e0fa95e21efa516c7b8dec/richieste-di-rimborso/7b198efa-3071-48b7-acb0-d166afb1b522'
      )
    ).toBe('/portale-esercenti/:initiativeId/richieste-di-rimborso/:batchId');
  });

  it('masks initiative and point-of-sale ids while preserving the route structure', () => {
    expect(sanitizeAnalyticsPath('/portale-esercenti/123456/punti-vendita/78910')).toBe(
      '/portale-esercenti/:initiativeId/punti-vendita/:pointOfSaleId'
    );
  });

  it('masks initiative ids from initiative-scoped routes', () => {
    expect(sanitizeAnalyticsPath('/portale-esercenti/69e0fa95e21efa516c7b8dec/panoramica')).toBe(
      '/portale-esercenti/:initiativeId/panoramica'
    );
  });

  it('masks all dynamic parameters from transaction routes', () => {
    expect(
      sanitizeAnalyticsPath(
        '/portale-esercenti/initiative-1/store-2/modifica-documento/transaction-3/document-4'
      )
    ).toBe(
      '/portale-esercenti/:initiativeId/:pointOfSaleId/modifica-documento/:trxId/:fileDocNumber'
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
        const {
          sanitizeAnalyticsPath: isolatedSanitizeAnalyticsPath,
        } = require('../analyticsPath');

        expect(isolatedSanitizeAnalyticsPath(inputPath)).toBe(expectedPath);
      });
    });
  });
});
