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
});
