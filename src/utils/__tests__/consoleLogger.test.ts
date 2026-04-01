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
    const groupSpy = jest.spyOn(console, 'group').mockImplementation(() => undefined);
    const groupCollapsedSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    const groupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

    enabledConsole.log('a');
    enabledConsole.debug('b');
    enabledConsole.info('c');
    enabledConsole.warn('d');
    enabledConsole.error('e');
    enabledConsole.trace('f');
    enabledConsole.group('g');
    enabledConsole.groupCollapsed('gc');
    enabledConsole.groupEnd();

    expect(logSpy).toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(traceSpy).toHaveBeenCalled();
    expect(groupSpy).toHaveBeenCalled();
    expect(groupCollapsedSpy).toHaveBeenCalled();
    expect(groupEndSpy).toHaveBeenCalled();
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

    expect(logSpy).toHaveBeenCalledTimes(2);

    // eslint-disable-next-line functional/immutable-data
    (console as any).group = originalGroup;
    // eslint-disable-next-line functional/immutable-data
    (console as any).groupCollapsed = originalGroupCollapsed;
    // eslint-disable-next-line functional/immutable-data
    (console as any).groupEnd = originalGroupEnd;
  });

  it('when DEBUG_CONSOLE is disabled, console methods are no-ops', async () => {
    jest.doMock('../constants', () => ({ DEBUG_CONSOLE: false }));
    const { browserConsole: disabledConsole } = await import('../consoleLogger');

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const traceSpy = jest.spyOn(console, 'trace').mockImplementation(() => undefined);
    const groupSpy = jest.spyOn(console, 'group').mockImplementation(() => undefined);
    const groupCollapsedSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    const groupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

    disabledConsole.log('a');
    disabledConsole.debug('b');
    disabledConsole.info('c');
    disabledConsole.warn('d');
    disabledConsole.error('e');
    disabledConsole.trace('f');
    disabledConsole.group('g');
    disabledConsole.groupCollapsed('gc');
    disabledConsole.groupEnd();

    expect(logSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(traceSpy).not.toHaveBeenCalled();
    expect(groupSpy).not.toHaveBeenCalled();
    expect(groupCollapsedSpy).not.toHaveBeenCalled();
    expect(groupEndSpy).not.toHaveBeenCalled();
  });
});
