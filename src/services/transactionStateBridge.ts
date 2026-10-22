import {
  MerchantTransactionDTO,
  MerchantTransactionsListDTO,
} from '../api/generated/merchants/data-contracts';
import { browserConsole } from '../utils/consoleLogger';
import { logTrxBridge } from '../utils/transactionBridgeLogger';

export const TRANSACTION_STATE_BRIDGE_TTL_MS = 30_000;

const STORAGE_KEY_PREFIX = 'idpay:merchant-transaction-state-bridge:';
const SCHEMA_VERSION = 1;

type TransactionStateBridgeOperation = 'invoice-update' | 'reversal';
type TransactionStateBridgeEffect = 'invoice' | 'reversal';

type PendingInvoiceData = {
  docNumber?: string;
  filename?: string;
};

export type PendingTransactionState = {
  schemaVersion: typeof SCHEMA_VERSION;
  initiativeId: string;
  transactionId: string;
  operation: TransactionStateBridgeOperation;
  effect: TransactionStateBridgeEffect;
  expectedTransactionRevision: number;
  invoice?: PendingInvoiceData;
  createdAt: number;
  expiresAt: number;
};

type PendingTransactionStateInput = Omit<
  PendingTransactionState,
  'schemaVersion' | 'createdAt' | 'expiresAt'
> & {
  now?: number;
  correlationId?: string;
};

const describePendingState = (state: PendingTransactionState, now = Date.now()) => ({
  initiativeId: state.initiativeId,
  trxId: state.transactionId,
  operation: state.operation,
  expectedRevision: state.expectedTransactionRevision,
  createdAt: new Date(state.createdAt).toISOString(),
  expiresAt: new Date(state.expiresAt).toISOString(),
  ageMs: now - state.createdAt,
  ttlRemainingMs: state.expiresAt - now,
  hasInvoiceDocNumber: state.invoice?.docNumber !== undefined,
  hasInvoiceFilename: state.invoice?.filename !== undefined,
});

const isSafeRevision = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const getStorageKey = (initiativeId: string, transactionId: string) =>
  `${STORAGE_KEY_PREFIX}${encodeURIComponent(initiativeId)}:${encodeURIComponent(transactionId)}`;

const warnStorageUnavailable = () => {
  browserConsole.warn('[transactionStateBridge] sessionStorage is unavailable');
  logTrxBridge('warn', 'storage.unavailable');
};

const getSessionStorage = (): Storage | undefined => {
  try {
    if (typeof sessionStorage === 'undefined') {
      warnStorageUnavailable();
      return undefined;
    }

    return sessionStorage;
  } catch {
    warnStorageUnavailable();
    return undefined;
  }
};

const isPendingInvoiceData = (value: unknown): value is PendingInvoiceData => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const invoice = value as Record<string, unknown>;

  return (
    (invoice.docNumber === undefined || typeof invoice.docNumber === 'string') &&
    (invoice.filename === undefined || typeof invoice.filename === 'string')
  );
};

const isPendingTransactionState = (value: unknown): value is PendingTransactionState => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const state = value as Record<string, unknown>;

  return (
    state.schemaVersion === SCHEMA_VERSION &&
    typeof state.initiativeId === 'string' &&
    state.initiativeId.length > 0 &&
    typeof state.transactionId === 'string' &&
    state.transactionId.length > 0 &&
    ((state.operation === 'invoice-update' && state.effect === 'invoice') ||
      (state.operation === 'reversal' && state.effect === 'reversal')) &&
    isSafeRevision(state.expectedTransactionRevision) &&
    (state.invoice === undefined || isPendingInvoiceData(state.invoice)) &&
    typeof state.createdAt === 'number' &&
    Number.isFinite(state.createdAt) &&
    typeof state.expiresAt === 'number' &&
    Number.isFinite(state.expiresAt) &&
    state.expiresAt > state.createdAt
  );
};

const removeStorageItem = (storage: Storage, key: string) => {
  try {
    storage.removeItem(key);
  } catch {
    warnStorageUnavailable();
  }
};

const readPendingFromStorage = (
  storage: Storage,
  key: string,
  now: number
): PendingTransactionState | undefined => {
  let rawValue: string | null;

  try {
    rawValue = storage.getItem(key);
  } catch {
    warnStorageUnavailable();
    return undefined;
  }

  if (!rawValue) {
    return undefined;
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    browserConsole.warn('[transactionStateBridge] discarded malformed sessionStorage value');
    logTrxBridge('warn', 'pending.discarded-malformed', { key });
    removeStorageItem(storage, key);
    return undefined;
  }

  if (!isPendingTransactionState(parsedValue)) {
    browserConsole.warn('[transactionStateBridge] discarded invalid sessionStorage value');
    logTrxBridge('warn', 'pending.discarded-invalid', { key });
    removeStorageItem(storage, key);
    return undefined;
  }

  if (parsedValue.expiresAt <= now) {
    // The overlay stops masking here: if the backend projection is still stale, the user sees it.
    logTrxBridge('warn', 'pending.expired-removed', {
      ...describePendingState(parsedValue, now),
      expiredSinceMs: now - parsedValue.expiresAt,
    });
    removeStorageItem(storage, key);
    return undefined;
  }

  return parsedValue;
};

export const getPendingTransactionState = (
  initiativeId: string,
  transactionId: string,
  now = Date.now()
): PendingTransactionState | undefined => {
  const storage = getSessionStorage();

  if (!storage) {
    return undefined;
  }

  const pendingState = readPendingFromStorage(
    storage,
    getStorageKey(initiativeId, transactionId),
    now
  );

  if (
    pendingState &&
    (pendingState.initiativeId !== initiativeId || pendingState.transactionId !== transactionId)
  ) {
    logTrxBridge('warn', 'pending.key-mismatch', {
      requestedInitiativeId: initiativeId,
      requestedTrxId: transactionId,
      ...describePendingState(pendingState, now),
    });
    removePendingTransactionState(initiativeId, transactionId, 'key-mismatch');
    return undefined;
  }

  return pendingState;
};

/**
 * Read-only, privacy-safe description for diagnostics: never removes expired or invalid
 * entries and never exposes invoice values.
 */
export const peekPendingTransactionState = (
  initiativeId: string,
  transactionId: string,
  now = Date.now()
): ReturnType<typeof describePendingState> | undefined => {
  try {
    if (typeof sessionStorage === 'undefined') {
      return undefined;
    }
    const rawValue = sessionStorage.getItem(getStorageKey(initiativeId, transactionId));
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : undefined;
    return isPendingTransactionState(parsedValue)
      ? describePendingState(parsedValue, now)
      : undefined;
  } catch {
    return undefined;
  }
};

type PendingStateSnapshotEntry =
  | ReturnType<typeof describePendingState>
  | { key: string; invalid: true };

/**
 * Read-only snapshot of all bridge entries (optionally scoped to an initiative) for diagnostics.
 */
export const getPendingTransactionStatesSnapshot = (
  initiativeId?: string,
  now = Date.now()
): Array<PendingStateSnapshotEntry> => {
  try {
    if (typeof sessionStorage === 'undefined') {
      return [];
    }

    return getBridgeStorageKeys(sessionStorage).flatMap((key): Array<PendingStateSnapshotEntry> => {
      const rawValue = sessionStorage.getItem(key);
      let parsedValue: unknown;
      try {
        parsedValue = rawValue ? JSON.parse(rawValue) : undefined;
      } catch {
        return [{ key, invalid: true as const }];
      }
      if (!isPendingTransactionState(parsedValue)) {
        return [{ key, invalid: true as const }];
      }
      if (initiativeId && parsedValue.initiativeId !== initiativeId) {
        return [];
      }
      return [describePendingState(parsedValue, now)];
    });
  } catch {
    return [];
  }
};

export const recordPendingTransactionState = ({
  initiativeId,
  transactionId,
  operation,
  effect,
  expectedTransactionRevision,
  invoice,
  now = Date.now(),
  correlationId,
}: PendingTransactionStateInput): void => {
  const logContext = {
    correlationId,
    initiativeId,
    trxId: transactionId,
    operation,
    expectedRevision: expectedTransactionRevision,
  };

  if (
    !initiativeId ||
    !transactionId ||
    !isSafeRevision(expectedTransactionRevision) ||
    (operation === 'invoice-update' && effect !== 'invoice') ||
    (operation === 'reversal' && effect !== 'reversal')
  ) {
    logTrxBridge('warn', 'pending.record-rejected-invalid-input', {
      ...logContext,
      effect,
      hasInitiativeId: Boolean(initiativeId),
      hasTrxId: Boolean(transactionId),
      isSafeRevision: isSafeRevision(expectedTransactionRevision),
    });
    return;
  }

  const storage = getSessionStorage();

  if (!storage) {
    logTrxBridge('warn', 'pending.record-skipped-no-storage', logContext);
    return;
  }

  const key = getStorageKey(initiativeId, transactionId);
  const currentState = readPendingFromStorage(storage, key, now);

  if (currentState && currentState.expectedTransactionRevision > expectedTransactionRevision) {
    logTrxBridge('warn', 'pending.record-ignored-older-revision', {
      ...logContext,
      current: describePendingState(currentState, now),
    });
    return;
  }

  if (currentState) {
    logTrxBridge('info', 'pending.record-overwrite', {
      ...logContext,
      previous: describePendingState(currentState, now),
    });
  }

  const pendingState: PendingTransactionState = {
    schemaVersion: SCHEMA_VERSION,
    initiativeId,
    transactionId,
    operation,
    effect,
    expectedTransactionRevision,
    ...(invoice ? { invoice } : {}),
    createdAt: now,
    expiresAt: now + TRANSACTION_STATE_BRIDGE_TTL_MS,
  };

  try {
    storage.setItem(key, JSON.stringify(pendingState));
    logTrxBridge('info', 'pending.recorded', {
      correlationId,
      ...describePendingState(pendingState, now),
      readBackOk: storage.getItem(key) !== null,
    });
  } catch {
    logTrxBridge('error', 'pending.record-write-failed', logContext);
    warnStorageUnavailable();
  }
};

export const removePendingTransactionState = (
  initiativeId: string,
  transactionId: string,
  reason: string = 'unspecified'
) => {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  const existing = peekPendingTransactionState(initiativeId, transactionId);
  logTrxBridge(existing ? 'info' : 'debug', 'pending.removed', {
    reason,
    initiativeId,
    trxId: transactionId,
    existed: Boolean(existing),
    ...(existing ? { previous: existing } : {}),
  });

  removeStorageItem(storage, getStorageKey(initiativeId, transactionId));
};

const getBridgeStorageKeys = (storage: Storage): Array<string> =>
  Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
    (key): key is string => Boolean(key?.startsWith(STORAGE_KEY_PREFIX))
  );

export const cleanupExpiredTransactionStates = (now = Date.now()): void => {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  try {
    getBridgeStorageKeys(storage).forEach((key) => {
      readPendingFromStorage(storage, key, now);
    });
  } catch {
    warnStorageUnavailable();
  }
};

export const clearPendingTransactionStates = (): void => {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  try {
    const keys = getBridgeStorageKeys(storage);
    logTrxBridge('info', 'pending.cleared-all', { count: keys.length });
    keys.forEach((key) => removeStorageItem(storage, key));
  } catch {
    warnStorageUnavailable();
  }
};

const mergeInvoiceData = (
  row: MerchantTransactionDTO,
  invoice?: PendingInvoiceData
): MerchantTransactionDTO => {
  if (!invoice || (invoice.docNumber === undefined && invoice.filename === undefined)) {
    return {
      ...row,
      status: 'INVOICED',
    };
  }

  return {
    ...row,
    status: 'INVOICED',
    invoiceData: {
      ...(row.invoiceData ?? {}),
      ...(invoice.docNumber !== undefined ? { docNumber: invoice.docNumber } : {}),
      ...(invoice.filename !== undefined ? { filename: invoice.filename } : {}),
    },
  };
};

const BATCH_MONTH_PATTERN = /^(\d{4})-(\d{2})/;

export type BatchMonthPosition = 'past' | 'current' | 'future';

/**
 * Positions a reward-batch month ("YYYY-MM" or an ISO date) relative to the current local
 * month. Returns undefined when the month is missing or cannot be parsed.
 */
export const getBatchMonthPosition = (
  batchMonth: string | undefined,
  now = Date.now()
): BatchMonthPosition | undefined => {
  const match = typeof batchMonth === 'string' ? BATCH_MONTH_PATTERN.exec(batchMonth) : null;
  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    return undefined;
  }

  const current = new Date(now);
  const batchIndex = year * 12 + (month - 1);
  const currentIndex = current.getFullYear() * 12 + current.getMonth();

  if (batchIndex < currentIndex) {
    return 'past';
  }
  return batchIndex === currentIndex ? 'current' : 'future';
};

export type ReconcileProcessedTransactionsContext = {
  /** Month of the reward batch the list is filtered by ("YYYY-MM"), when known. */
  batchMonth?: string;
};

export const reconcileProcessedTransactions = (
  initiativeId: string,
  response: MerchantTransactionsListDTO,
  now = Date.now(),
  correlationId?: string,
  context: ReconcileProcessedTransactionsContext = {}
): MerchantTransactionsListDTO => {
  const batchMonthPosition = getBatchMonthPosition(context.batchMonth, now);

  logTrxBridge('debug', 'reconcile.start', {
    correlationId,
    initiativeId,
    batchMonth: context.batchMonth,
    batchMonthPosition,
    pageNo: response.pageNo,
    pageSize: response.pageSize,
    totalElements: response.totalElements,
    rowsCount: Array.isArray(response.content) ? response.content.length : null,
    pendingBeforeCleanup: getPendingTransactionStatesSnapshot(initiativeId, now),
  });

  cleanupExpiredTransactionStates(now);

  if (!Array.isArray(response.content)) {
    logTrxBridge('warn', 'reconcile.no-content-array', { correlationId, initiativeId });
    return response;
  }

  logTrxBridge('debug', 'reconcile.rows', {
    correlationId,
    rows: response.content.map((row) => ({
      trxId: row.trxId,
      revision: row.transactionRevision,
      status: row.status,
      rewardBatchId: row.rewardBatchId,
      rewardBatchTrxStatus: row.rewardBatchTrxStatus,
    })),
  });

  const content = response.content.flatMap((row) => {
    const pendingState = getPendingTransactionState(initiativeId, row.trxId, now);

    if (!pendingState) {
      return [row];
    }

    const decisionContext = {
      correlationId,
      ...describePendingState(pendingState, now),
      rowRevision: row.transactionRevision,
      rowRevisionType: typeof row.transactionRevision,
      rowStatus: row.status,
      rowRewardBatchTrxStatus: row.rewardBatchTrxStatus,
      rowUpdateDate: row.updateDate,
    };

    if (
      isSafeRevision(row.transactionRevision) &&
      row.transactionRevision >= pendingState.expectedTransactionRevision
    ) {
      // For a reversal, a caught-up row still present in the list may indicate a backend
      // projection/contract issue (the row is shown unmasked).
      logTrxBridge(
        pendingState.operation === 'reversal' ? 'warn' : 'info',
        'reconcile.caught-up-show-api-row',
        {
          ...decisionContext,
          revisionDelta: row.transactionRevision - pendingState.expectedTransactionRevision,
        }
      );
      removePendingTransactionState(
        initiativeId,
        row.trxId,
        `reconcile-caught-up:${correlationId ?? '-'}`
      );
      return [row];
    }

    if (!isSafeRevision(row.transactionRevision)) {
      logTrxBridge('warn', 'reconcile.row-without-valid-revision', decisionContext);
    }

    if (pendingState.operation === 'reversal') {
      logTrxBridge('info', 'reconcile.stale-reversal-row-suppressed', decisionContext);
      return [];
    }

    // An invoice update in a past-month batch moves the transaction out of that batch;
    // in a current- or future-month batch the transaction stays with the new invoice.
    if (batchMonthPosition === 'past') {
      logTrxBridge('info', 'reconcile.stale-invoice-row-suppressed-past-month', {
        ...decisionContext,
        batchMonth: context.batchMonth,
        batchMonthPosition,
      });
      return [];
    }

    logTrxBridge('info', 'reconcile.stale-invoice-row-merged', {
      ...decisionContext,
      batchMonth: context.batchMonth,
      batchMonthPosition,
    });
    return [mergeInvoiceData(row, pendingState.invoice)];
  });

  const returnedTrxIds = new Set(response.content.map((row) => row.trxId));
  const absentPending = getPendingTransactionStatesSnapshot(initiativeId, now).filter(
    (state) => !('invalid' in state) && !returnedTrxIds.has(state.trxId)
  );

  logTrxBridge('debug', 'reconcile.end', {
    correlationId,
    rowsIn: response.content.length,
    rowsOut: content.length,
    pendingNotInPage: absentPending,
  });

  return {
    ...response,
    content,
  };
};
