import { browserConsole } from '../consoleLogger';

describe('consoleLogger', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('when DEBUG_CONSOLE is disabled, whenEnabled must not execute callback', async () => {
    jest.doMock('../constants', () => ({ DEBUG_CONSOLE: false }));
    const { browserConsole: disabledConsole } = await import('../consoleLogger');

    const fn = jest.fn();
    disabledConsole.whenEnabled(fn);
    expect(fn).not.toHaveBeenCalled();
    expect(disabledConsole.enabled).toBe(false);
  });

  it('when DEBUG_CONSOLE is enabled, whenEnabled executes callback and methods delegate to native console', async () => {
    jest.doMock('../constants', () => ({ DEBUG_CONSOLE: true }));
    const { browserConsole: enabledConsole } = await import('../consoleLogger');

    const fn = jest.fn();
    enabledConsole.whenEnabled(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(enabledConsole.enabled).toBe(true);

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const traceSpy = jest.spyOn(console, 'trace').mockImplementation(() => undefined);

    enabledConsole.log('a');
    enabledConsole.debug('b');
    enabledConsole.info('c');
    enabledConsole.warn('d');
    enabledConsole.error('e');
    enabledConsole.trace('f');

    expect(logSpy).toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(traceSpy).toHaveBeenCalled();
  });

  it('group methods fall back when console group APIs are missing (DEBUG_CONSOLE enabled)', async () => {
    jest.doMock('../constants', () => ({ DEBUG_CONSOLE: true }));
    const { browserConsole: enabledConsole } = await import('../consoleLogger');

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

    enabledConsole.group('g1');
    enabledConsole.groupCollapsed('g2');
    enabledConsole.groupEnd();

    expect(logSpy).toHaveBeenCalled();

    // eslint-disable-next-line functional/immutable-data
    (console as any).group = originalGroup;
    // eslint-disable-next-line functional/immutable-data
    (console as any).groupCollapsed = originalGroupCollapsed;
    // eslint-disable-next-line functional/immutable-data
    (console as any).groupEnd = originalGroupEnd;
  });
});
