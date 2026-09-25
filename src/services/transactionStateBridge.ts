import {
  MerchantTransactionDTO,
  MerchantTransactionsListDTO,
} from '../api/generated/merchants/data-contracts';
import { browserConsole } from '../utils/consoleLogger';

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
};

const isSafeRevision = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const getStorageKey = (initiativeId: string, transactionId: string) =>
  `${STORAGE_KEY_PREFIX}${encodeURIComponent(initiativeId)}:${encodeURIComponent(transactionId)}`;

const warnStorageUnavailable = () =>
  browserConsole.warn('[transactionStateBridge] sessionStorage is unavailable');

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
    removeStorageItem(storage, key);
    return undefined;
  }

  if (!isPendingTransactionState(parsedValue)) {
    browserConsole.warn('[transactionStateBridge] discarded invalid sessionStorage value');
    removeStorageItem(storage, key);
    return undefined;
  }

  if (parsedValue.expiresAt <= now) {
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
    removePendingTransactionState(initiativeId, transactionId);
    return undefined;
  }

  return pendingState;
};

export const recordPendingTransactionState = ({
  initiativeId,
  transactionId,
  operation,
  effect,
  expectedTransactionRevision,
  invoice,
  now = Date.now(),
}: PendingTransactionStateInput): void => {
  if (
    !initiativeId ||
    !transactionId ||
    !isSafeRevision(expectedTransactionRevision) ||
    (operation === 'invoice-update' && effect !== 'invoice') ||
    (operation === 'reversal' && effect !== 'reversal')
  ) {
    return;
  }

  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  const key = getStorageKey(initiativeId, transactionId);
  const currentState = readPendingFromStorage(storage, key, now);

  if (currentState && currentState.expectedTransactionRevision > expectedTransactionRevision) {
    return;
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
  } catch {
    warnStorageUnavailable();
  }
};

export const removePendingTransactionState = (initiativeId: string, transactionId: string) => {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

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
    getBridgeStorageKeys(storage).forEach((key) => removeStorageItem(storage, key));
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

export const reconcileProcessedTransactions = (
  initiativeId: string,
  response: MerchantTransactionsListDTO,
  now = Date.now()
): MerchantTransactionsListDTO => {
  cleanupExpiredTransactionStates(now);

  if (!Array.isArray(response.content)) {
    return response;
  }

  const content = response.content.flatMap((row) => {
    const pendingState = getPendingTransactionState(initiativeId, row.trxId, now);

    if (!pendingState || !isSafeRevision(row.transactionRevision)) {
      return [row];
    }

    if (row.transactionRevision >= pendingState.expectedTransactionRevision) {
      removePendingTransactionState(initiativeId, row.trxId);
      return [row];
    }

    if (pendingState.operation === 'reversal') {
      return [];
    }

    return [mergeInvoiceData(row, pendingState.invoice)];
  });

  return {
    ...response,
    content,
  };
};
