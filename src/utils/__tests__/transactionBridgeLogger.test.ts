import {
  clearTrxBridgeLogs,
  describeError,
  dumpTrxBridgeLogs,
  getTrxBridgeLogs,
  logTrxBridge,
  nextTrxBridgeCorrelationId,
  TRX_BRIDGE_DEBUG_FLAG_KEY,
} from '../transactionBridgeLogger';

describe('transactionBridgeLogger', () => {
  beforeEach(() => {
    clearTrxBridgeLogs();
    localStorage.removeItem(TRX_BRIDGE_DEBUG_FLAG_KEY);
    jest.restoreAllMocks();
  });

  it('buffers every event and prints only warn/error when verbose mode is off', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    logTrxBridge('debug', 'debug-event', { a: 1 });
    logTrxBridge('warn', 'warn-event');

    expect(getTrxBridgeLogs().map((entry) => entry.event)).toEqual(['debug-event', 'warn-event']);
    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(dumpTrxBridgeLogs())).toHaveLength(2);
  });

  it('prints debug events when enabled through window API', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    window.idpayTrxBridgeDebug?.enable();
    logTrxBridge('debug', 'debug-event');

    expect(logSpy).toHaveBeenCalledTimes(1);
    window.idpayTrxBridgeDebug?.disable();
    expect(localStorage.getItem(TRX_BRIDGE_DEBUG_FLAG_KEY)).toBeNull();
  });

  it('keeps at most 500 entries', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    Array.from({ length: 510 }).forEach((_, i) => logTrxBridge('debug', `e-${i}`));

    const logs = getTrxBridgeLogs();
    expect(logs).toHaveLength(500);
    expect(logs[0].event).toBe('e-10');
  });

  it('creates incremental correlation ids and describes errors', () => {
    const first = nextTrxBridgeCorrelationId('x');
    const second = nextTrxBridgeCorrelationId('x');

    expect(first).not.toBe(second);
    expect(describeError({ name: 'ApiError', message: 'boom', status: 409, code: 'C' })).toEqual({
      errorName: 'ApiError',
      errorMessage: 'boom',
      errorStatus: 409,
      errorCode: 'C',
    });
    expect(describeError('plain')).toEqual({ error: 'plain' });
  });
});
