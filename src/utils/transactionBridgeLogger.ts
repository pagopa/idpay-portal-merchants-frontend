import { DEBUG_CONSOLE } from './constants';

/**
 * Diagnostic logger for the transaction state bridge (invoice update / reversal overlay).
 *
 * - Every event is kept in an in-memory ring buffer, readable from the browser console with
 *   `window.idpayTrxBridgeDebug.dump()`.
 * - `warn`/`error` events are always printed; `debug`/`info` events are printed only when
 *   `DEBUG_CONSOLE` is true or after `window.idpayTrxBridgeDebug.enable()`
 *   (persisted in localStorage under TRX_BRIDGE_DEBUG_FLAG_KEY).
 * - Never log personal data (fiscal codes, file names, document numbers).
 */

export const TRX_BRIDGE_DEBUG_FLAG_KEY = 'idpay:debug:trx-state-bridge';

const MAX_LOG_ENTRIES = 500;
const LOG_PREFIX = '[trxStateBridge]';

export type TrxBridgeLogLevel = 'debug' | 'info' | 'warn' | 'error';
export type TrxBridgeLogData = Record<string, unknown>;

export type TrxBridgeLogEntry = {
  seq: number;
  at: string;
  perfMs: number;
  level: TrxBridgeLogLevel;
  event: string;
  data?: TrxBridgeLogData;
};

let entries: ReadonlyArray<TrxBridgeLogEntry> = [];
let sequence = 0;
let correlationSequence = 0;

const perfNow = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? Math.round(performance.now())
    : Date.now();

const isVerboseEnabled = (): boolean => {
  if (DEBUG_CONSOLE) {
    return true;
  }

  try {
    return (
      typeof localStorage !== 'undefined' && localStorage.getItem(TRX_BRIDGE_DEBUG_FLAG_KEY) === '1'
    );
  } catch {
    return false;
  }
};

const printToConsole = (entry: TrxBridgeLogEntry) => {
  const args = [LOG_PREFIX, `#${entry.seq}`, entry.at, entry.event, entry.data ?? {}];

  switch (entry.level) {
    case 'error':
      console.error(...args);
      break;
    case 'warn':
      console.warn(...args);
      break;
    case 'info':
      console.info(...args);
      break;
    default:
      console.log(...args);
  }
};

export const nextTrxBridgeCorrelationId = (prefix: string): string => {
  correlationSequence += 1;
  return `${prefix}-${correlationSequence}`;
};

export const logTrxBridge = (
  level: TrxBridgeLogLevel,
  event: string,
  data?: TrxBridgeLogData
): void => {
  try {
    sequence += 1;

    const entry: TrxBridgeLogEntry = {
      seq: sequence,
      at: new Date().toISOString(),
      perfMs: perfNow(),
      level,
      event,
      ...(data ? { data } : {}),
    };

    entries = [...entries, entry].slice(-MAX_LOG_ENTRIES);

    if (level === 'warn' || level === 'error' || isVerboseEnabled()) {
      printToConsole(entry);
    }
  } catch {
    // diagnostics must never break the application flow
  }
};

export const getTrxBridgeLogs = (): ReadonlyArray<TrxBridgeLogEntry> => entries;

export const clearTrxBridgeLogs = (): void => {
  entries = [];
};

export const dumpTrxBridgeLogs = (): string => JSON.stringify(entries, null, 2);

export const describeError = (error: unknown): TrxBridgeLogData => {
  if (typeof error !== 'object' || error === null) {
    return { error: String(error) };
  }

  const err = error as Record<string, unknown>;

  return {
    errorName: typeof err.name === 'string' ? err.name : undefined,
    errorMessage: typeof err.message === 'string' ? err.message : undefined,
    errorStatus: typeof err.status === 'number' ? err.status : undefined,
    errorCode: typeof err.code === 'string' ? err.code : undefined,
  };
};

type TrxBridgeDebugApi = {
  logs: () => ReadonlyArray<TrxBridgeLogEntry>;
  dump: () => string;
  clear: () => void;
  enable: () => void;
  disable: () => void;
};

declare global {
  interface Window {
    idpayTrxBridgeDebug?: TrxBridgeDebugApi;
  }
}

const setVerboseFlag = (enabled: boolean) => {
  try {
    if (enabled) {
      localStorage.setItem(TRX_BRIDGE_DEBUG_FLAG_KEY, '1');
    } else {
      localStorage.removeItem(TRX_BRIDGE_DEBUG_FLAG_KEY);
    }
  } catch {
    // localStorage unavailable
  }
};

if (typeof window !== 'undefined') {
  try {
    // eslint-disable-next-line functional/immutable-data
    Object.defineProperty(window, 'idpayTrxBridgeDebug', {
      configurable: true,
      value: {
        logs: getTrxBridgeLogs,
        dump: dumpTrxBridgeLogs,
        clear: clearTrxBridgeLogs,
        enable: () => setVerboseFlag(true),
        disable: () => setVerboseFlag(false),
      } as TrxBridgeDebugApi,
    });
  } catch {
    // window not writable
  }
}
