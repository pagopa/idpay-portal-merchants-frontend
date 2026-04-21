import { buildRoute } from '../routeBuilder';
import { browserConsole } from '../consoleLogger';

jest.mock('../consoleLogger', () => ({
  browserConsole: {
    warn: jest.fn(),
    error: jest.fn(),
    groupCollapsed: jest.fn(),
    groupEnd: jest.fn(),
    log: jest.fn(),
  },
}));

describe('buildRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('replaces all params in the template', () => {
    const result = buildRoute('/:id/:pointOfSaleId/modifica/:trxId', {
      id: '123',
      pointOfSaleId: '456',
      trxId: '789',
    });

    expect(result).toBe('/123/456/modifica/789');
    expect(browserConsole.warn).not.toHaveBeenCalled();
  });

  it('encodes parameter values', () => {
    const result = buildRoute('/user/:name', {
      name: 'Mario Rossi',
    });

    expect(result).toBe('/user/Mario%20Rossi');
  });

  it('warns and skips undefined or null params', () => {
    const result = buildRoute('/user/:id/:section', {
      id: undefined,
      section: null as unknown as string,
    });

    expect(browserConsole.warn).toHaveBeenCalledTimes(3);
    expect((browserConsole.warn as jest.Mock).mock.calls[0][0]).toContain(
      'Param "id" is undefined'
    );
    expect((browserConsole.warn as jest.Mock).mock.calls[1][0]).toContain(
      'Param "section" is null'
    );
    expect((browserConsole.warn as jest.Mock).mock.calls[2][0]).toContain('Unresolved params');

    expect(result).toBe('/user/:id/:section');
  });

  it('warns if some params remain unresolved', () => {
    const result = buildRoute('/user/:id/:section', {
      id: '123',
      section: undefined,
    });

    expect(result).toBe('/user/123/:section');
    expect(browserConsole.warn).toHaveBeenCalledWith(
      expect.stringContaining('Param "section" is undefined')
    );
    expect(browserConsole.warn).toHaveBeenCalledWith(
      expect.stringContaining('Unresolved params :section')
    );
  });
});
