import { browserConsole } from '../consoleLogger';

describe('consoleLogger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should execute callback in whenEnabled (covers branch with DEBUG_CONSOLE=true in test env)', () => {
    const fn = jest.fn();
    browserConsole.whenEnabled(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('enabled getter should return boolean (covers getter line)', () => {
    expect(typeof browserConsole.enabled).toBe('boolean');
  });

  it('should delegate log methods when enabled', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const traceSpy = jest.spyOn(console, 'trace').mockImplementation(() => undefined);

    browserConsole.log('a');
    browserConsole.debug('b');
    browserConsole.info('c');
    browserConsole.warn('d');
    browserConsole.error('e');
    browserConsole.trace('f');

    expect(logSpy).toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(traceSpy).toHaveBeenCalled();
  });

  it('group methods should fall back gracefully when console group APIs are missing', () => {
    const originalGroup = console.group;
    const originalGroupCollapsed = console.groupCollapsed;
    const originalGroupEnd = console.groupEnd;

    // eslint-disable-next-line functional/immutable-data
    (console as any).group = undefined;
    // eslint-disable-next-line functional/immutable-data
    (console as any).groupCollapsed = undefined;
    // eslint-disable-next-line functional/immutable-data
    (console as any).groupEnd = undefined;

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    browserConsole.group('g1');
    browserConsole.groupCollapsed('g2');
    browserConsole.groupEnd();

    expect(logSpy).toHaveBeenCalled();

    // eslint-disable-next-line functional/immutable-data
    (console as any).group = originalGroup;
    // eslint-disable-next-line functional/immutable-data
    (console as any).groupCollapsed = originalGroupCollapsed;
    // eslint-disable-next-line functional/immutable-data
    (console as any).groupEnd = originalGroupEnd;
  });
});
