import {
  clearPendingTransactionStates,
  cleanupExpiredTransactionStates,
  getPendingTransactionState,
  isCurrentBatchMonth,
  reconcileProcessedTransactions,
  recordPendingTransactionState,
  removePendingTransactionState,
  TRANSACTION_STATE_BRIDGE_TTL_MS,
} from '../transactionStateBridge';
import { MerchantTransactionsListDTO } from '../../api/generated/merchants/data-contracts';

const getStorageKey = (initiativeId: string, transactionId: string) =>
  `idpay:merchant-transaction-state-bridge:${encodeURIComponent(initiativeId)}:${encodeURIComponent(
    transactionId
  )}`;

const createPersistedState = (overrides: Record<string, unknown> = {}) => ({
  schemaVersion: 1,
  initiativeId: 'initiative-1',
  transactionId: 'transaction-1',
  operation: 'invoice-update',
  effect: 'invoice',
  expectedTransactionRevision: 10,
  createdAt: 100,
  expiresAt: 100 + TRANSACTION_STATE_BRIDGE_TTL_MS,
  ...overrides,
});

const withSessionStorage = (storage: Storage | undefined, callback: () => void) => {
  const storageDescriptor = Object.getOwnPropertyDescriptor(global, 'sessionStorage');

  Object.defineProperty(global, 'sessionStorage', {
    configurable: true,
    value: storage,
  });

  try {
    callback();
  } finally {
    if (storageDescriptor) {
      Object.defineProperty(global, 'sessionStorage', storageDescriptor);
    } else {
      delete (global as any).sessionStorage;
    }
  }
};

describe('transactionStateBridge', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('stores invoice metadata and ignores an out-of-order lower revision', () => {
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 10,
      invoice: { docNumber: 'DOC-10', filename: 'invoice.pdf' },
      now: 100,
    });

    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'reversal',
      effect: 'reversal',
      expectedTransactionRevision: 9,
      now: 110,
    });

    expect(getPendingTransactionState('initiative-1', 'transaction-1', 110)).toEqual({
      schemaVersion: 1,
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 10,
      invoice: { docNumber: 'DOC-10', filename: 'invoice.pdf' },
      createdAt: 100,
      expiresAt: 100 + TRANSACTION_STATE_BRIDGE_TTL_MS,
    });
  });

  it('replaces a pending record with an equal or higher revision', () => {
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 10,
      now: 100,
    });

    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'reversal',
      effect: 'reversal',
      expectedTransactionRevision: 10,
      now: 110,
    });

    expect(getPendingTransactionState('initiative-1', 'transaction-1', 110)?.operation).toBe(
      'reversal'
    );
  });

  it('rejects invalid transaction state inputs', () => {
    const invalidInputs: Array<Parameters<typeof recordPendingTransactionState>[0]> = [
      {
        initiativeId: '',
        transactionId: 'transaction-1',
        operation: 'invoice-update',
        effect: 'invoice',
        expectedTransactionRevision: 10,
      },
      {
        initiativeId: 'initiative-1',
        transactionId: '',
        operation: 'invoice-update',
        effect: 'invoice',
        expectedTransactionRevision: 10,
      },
      {
        initiativeId: 'initiative-1',
        transactionId: 'transaction-1',
        operation: 'invoice-update',
        effect: 'invoice',
        expectedTransactionRevision: -1,
      },
      {
        initiativeId: 'initiative-1',
        transactionId: 'transaction-1',
        operation: 'invoice-update',
        effect: 'invoice',
        expectedTransactionRevision: 1.5,
      },
      {
        initiativeId: 'initiative-1',
        transactionId: 'transaction-1',
        operation: 'invoice-update',
        effect: 'invoice',
        expectedTransactionRevision: Number.MAX_SAFE_INTEGER + 1,
      },
      {
        initiativeId: 'initiative-1',
        transactionId: 'transaction-1',
        operation: 'invoice-update',
        effect: 'reversal',
        expectedTransactionRevision: 10,
      },
      {
        initiativeId: 'initiative-1',
        transactionId: 'transaction-1',
        operation: 'reversal',
        effect: 'invoice',
        expectedTransactionRevision: 10,
      },
    ];

    invalidInputs.forEach((input) => recordPendingTransactionState(input));

    expect(sessionStorage.length).toBe(0);
  });

  it('merges only the expected invoice fields while the list row is stale', () => {
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 10,
      invoice: { docNumber: 'DOC-10', filename: 'invoice.pdf' },
      now: 100,
    });

    const row = {
      trxId: 'transaction-1',
      transactionRevision: 9,
      status: 'REWARDED',
      fiscalCode: 'AAAAAA00A00A000A',
      effectiveAmountCents: 100,
      rewardAmountCents: 10,
      unrelated: 'preserved',
    };

    const response = reconcileProcessedTransactions(
      'initiative-1',
      {
        content: [row],
        pageNo: 0,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
      } as unknown as MerchantTransactionsListDTO,
      100
    );

    expect(response.content).toEqual([
      {
        ...row,
        status: 'INVOICED',
        invoiceData: { docNumber: 'DOC-10', filename: 'invoice.pdf' },
      },
    ]);
    expect(getPendingTransactionState('initiative-1', 'transaction-1', 100)).toBeDefined();
  });

  it('removes the pending record and shows the API row at the expected revision', () => {
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 10,
      invoice: { docNumber: 'DOC-10', filename: 'invoice.pdf' },
    });

    const row = {
      trxId: 'transaction-1',
      transactionRevision: 10,
      status: 'INVOICED',
      invoiceData: { docNumber: 'DOC-10', filename: 'invoice.pdf' },
    };

    const response = reconcileProcessedTransactions('initiative-1', {
      content: [row],
      pageNo: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
    } as unknown as MerchantTransactionsListDTO);

    expect(response.content).toEqual([row]);
    expect(getPendingTransactionState('initiative-1', 'transaction-1')).toBeUndefined();
  });

  it('suppresses only stale reversal rows and preserves server pagination totals', () => {
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'reversal',
      effect: 'reversal',
      expectedTransactionRevision: 10,
    });

    const response = reconcileProcessedTransactions('initiative-1', {
      content: [
        { trxId: 'transaction-1', transactionRevision: 9 },
        { trxId: 'transaction-2', transactionRevision: 9 },
      ],
      pageNo: 0,
      pageSize: 10,
      totalElements: 2,
      totalPages: 1,
    } as unknown as MerchantTransactionsListDTO);

    expect(response.content).toEqual([{ trxId: 'transaction-2', transactionRevision: 9 }]);
    expect(response.totalElements).toBe(2);
  });

  it('reconciles stale invoice rows with missing or partial metadata', () => {
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'without-metadata',
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 10,
      now: 100,
    });
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'empty-metadata',
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 10,
      invoice: {},
      now: 100,
    });
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'doc-number-only',
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 10,
      invoice: { docNumber: 'DOC-12' },
      now: 100,
    });
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'filename-only',
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 10,
      invoice: { filename: 'new-invoice.pdf' },
      now: 100,
    });

    const rows = [
      {
        trxId: 'without-metadata',
        transactionRevision: 9,
        status: 'REWARDED',
      },
      {
        trxId: 'empty-metadata',
        transactionRevision: 9,
        status: 'REWARDED',
        invoiceData: { filename: 'existing-invoice.pdf' },
      },
      {
        trxId: 'doc-number-only',
        transactionRevision: 9,
        status: 'REWARDED',
        invoiceData: { filename: 'existing-invoice.pdf' },
      },
      {
        trxId: 'filename-only',
        transactionRevision: 9,
        status: 'REWARDED',
        invoiceData: { docNumber: 'DOC-OLD' },
      },
    ];

    const response = reconcileProcessedTransactions(
      'initiative-1',
      {
        content: rows,
        pageNo: 0,
        pageSize: 10,
        totalElements: rows.length,
        totalPages: 1,
      } as unknown as MerchantTransactionsListDTO,
      100
    );

    expect(response.content).toEqual([
      { ...rows[0], status: 'INVOICED' },
      { ...rows[1], status: 'INVOICED' },
      {
        ...rows[2],
        status: 'INVOICED',
        invoiceData: { filename: 'existing-invoice.pdf', docNumber: 'DOC-12' },
      },
      {
        ...rows[3],
        status: 'INVOICED',
        invoiceData: { docNumber: 'DOC-OLD', filename: 'new-invoice.pdf' },
      },
    ]);
  });

  it('shows rows without a revision unchanged and keeps the pending state until expiry', () => {
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'reversal',
      effect: 'reversal',
      expectedTransactionRevision: 10,
      now: 100,
    });

    const row = { trxId: 'transaction-1', status: 'INVOICED' };
    const response = reconcileProcessedTransactions(
      'initiative-1',
      {
        content: [row],
        pageNo: 0,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
      } as unknown as MerchantTransactionsListDTO,
      100
    );

    expect(response.content).toEqual([]);
    expect(getPendingTransactionState('initiative-1', 'transaction-1', 100)).toBeDefined();
    expect(
      getPendingTransactionState(
        'initiative-1',
        'transaction-1',
        100 + TRANSACTION_STATE_BRIDGE_TTL_MS
      )
    ).toBeUndefined();
  });

  it('cleans expired bridge records without removing unrelated session data', () => {
    const now = Date.now();
    const activeKey = getStorageKey('initiative-1', 'active');
    const expiredKey = getStorageKey('initiative-1', 'expired');

    sessionStorage.setItem(
      activeKey,
      JSON.stringify(
        createPersistedState({
          transactionId: 'active',
          createdAt: now,
          expiresAt: now + TRANSACTION_STATE_BRIDGE_TTL_MS,
        })
      )
    );
    sessionStorage.setItem(
      expiredKey,
      JSON.stringify(
        createPersistedState({
          transactionId: 'expired',
          createdAt: now - TRANSACTION_STATE_BRIDGE_TTL_MS,
          expiresAt: now - 1,
        })
      )
    );
    sessionStorage.setItem('storesPagination', '{"page":1}');

    cleanupExpiredTransactionStates();

    expect(sessionStorage.getItem(activeKey)).not.toBeNull();
    expect(sessionStorage.getItem(expiredKey)).toBeNull();
    expect(sessionStorage.getItem('storesPagination')).toBe('{"page":1}');
  });

  it('discards persisted values that do not match the transaction state schema', () => {
    const key = getStorageKey('initiative-1', 'transaction-1');
    const invalidStates: Array<unknown> = [
      null,
      'not-an-object',
      createPersistedState({ schemaVersion: 2 }),
      createPersistedState({ initiativeId: '' }),
      createPersistedState({ transactionId: '' }),
      createPersistedState({ operation: 'unknown' }),
      createPersistedState({ operation: 'invoice-update', effect: 'reversal' }),
      createPersistedState({ expectedTransactionRevision: -1 }),
      createPersistedState({ expectedTransactionRevision: 1.5 }),
      createPersistedState({ invoice: null }),
      createPersistedState({ invoice: 1 }),
      createPersistedState({ invoice: { docNumber: 1 } }),
      createPersistedState({ invoice: { docNumber: 'DOC-1', filename: 1 } }),
      createPersistedState({ createdAt: '100' }),
      createPersistedState({ expiresAt: null }),
      createPersistedState({ expiresAt: 100 }),
    ];

    invalidStates.forEach((state) => {
      sessionStorage.setItem(key, JSON.stringify(state) ?? '');

      expect(getPendingTransactionState('initiative-1', 'transaction-1', 101)).toBeUndefined();
      expect(sessionStorage.getItem(key)).toBeNull();
    });
  });

  it('discards a stored state that belongs to a different transaction', () => {
    const key = getStorageKey('initiative-1', 'transaction-1');
    sessionStorage.setItem(
      key,
      JSON.stringify(createPersistedState({ initiativeId: 'initiative-2' }))
    );

    expect(getPendingTransactionState('initiative-1', 'transaction-1', 101)).toBeUndefined();
    expect(sessionStorage.getItem(key)).toBeNull();
  });

  it('discards malformed values and clears all bridge records on logout', () => {
    const key = getStorageKey('initiative-1', 'transaction-1');
    sessionStorage.setItem(key, '{malformed');

    expect(getPendingTransactionState('initiative-1', 'transaction-1')).toBeUndefined();
    expect(sessionStorage.getItem(key)).toBeNull();
    sessionStorage.setItem('storesPagination', '{"page":1}');

    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'reversal',
      effect: 'reversal',
      expectedTransactionRevision: 10,
    });

    clearPendingTransactionStates();

    expect(getPendingTransactionState('initiative-1', 'transaction-1')).toBeUndefined();
    expect(sessionStorage.getItem(key)).toBeNull();
    expect(sessionStorage.getItem('storesPagination')).toBe('{"page":1}');
  });

  it('handles sessionStorage read, write, and removal errors', () => {
    const storage: Storage = {
      length: 0,
      clear: () => undefined,
      getItem: () => {
        throw new Error('sessionStorage read failed');
      },
      key: () => null,
      removeItem: () => {
        throw new Error('sessionStorage removal failed');
      },
      setItem: () => {
        throw new Error('sessionStorage write failed');
      },
    };

    withSessionStorage(storage, () => {
      expect(getPendingTransactionState('initiative-1', 'transaction-1')).toBeUndefined();
      expect(() =>
        recordPendingTransactionState({
          initiativeId: 'initiative-1',
          transactionId: 'transaction-1',
          operation: 'reversal',
          effect: 'reversal',
          expectedTransactionRevision: 10,
        })
      ).not.toThrow();
      expect(() => removePendingTransactionState('initiative-1', 'transaction-1')).not.toThrow();
    });
  });

  it('continues cleanup when sessionStorage key enumeration fails', () => {
    const storage: Storage = {
      length: 1,
      clear: () => undefined,
      getItem: () => null,
      key: () => {
        throw new Error('sessionStorage key access failed');
      },
      removeItem: () => undefined,
      setItem: () => undefined,
    };

    withSessionStorage(storage, () => {
      expect(() => cleanupExpiredTransactionStates()).not.toThrow();
      expect(() => clearPendingTransactionStates()).not.toThrow();
    });
  });

  it('does not fail when storage is unavailable', () => {
    const originalSessionStorage = global.sessionStorage;

    delete (global as any).sessionStorage;

    try {
      expect(() =>
        recordPendingTransactionState({
          initiativeId: 'initiative-1',
          transactionId: 'transaction-1',
          operation: 'reversal',
          effect: 'reversal',
          expectedTransactionRevision: 10,
        })
      ).not.toThrow();
      expect(getPendingTransactionState('initiative-1', 'transaction-1')).toBeUndefined();
      expect(() => removePendingTransactionState('initiative-1', 'transaction-1')).not.toThrow();
      expect(() => cleanupExpiredTransactionStates()).not.toThrow();
      expect(() => clearPendingTransactionStates()).not.toThrow();
    } finally {
      global.sessionStorage = originalSessionStorage;
    }
  });

  it('does not fail when accessing sessionStorage throws', () => {
    const storageDescriptor = Object.getOwnPropertyDescriptor(global, 'sessionStorage');

    Object.defineProperty(global, 'sessionStorage', {
      configurable: true,
      get: () => {
        throw new Error('sessionStorage access failed');
      },
    });

    try {
      expect(getPendingTransactionState('initiative-1', 'transaction-1')).toBeUndefined();
    } finally {
      if (storageDescriptor) {
        Object.defineProperty(global, 'sessionStorage', storageDescriptor);
      } else {
        delete (global as any).sessionStorage;
      }
    }
  });

  afterEach(() => {
    removePendingTransactionState('initiative-1', 'transaction-1');
  });

  it('should keep the transaction hidden during a reversal even if transactionRevision is undefined', () => {
    const initiativeId = 'init-1';
    const transactionId = 'trx-123';

    recordPendingTransactionState({
      initiativeId,
      transactionId,
      operation: 'reversal',
      effect: 'reversal',
      expectedTransactionRevision: 2,
    });

    const mockApiResponse = {
      content: [
        {
          trxId: transactionId,
          transactionRevision: undefined,
          status: 'AUTHORIZED'
        }
      ]
    };

    const result = reconcileProcessedTransactions(initiativeId, mockApiResponse);

    expect(result.content).toHaveLength(0);
  });

});

describe('transactionStateBridge batch month handling', () => {
  // 15 March 2026, local time
  const NOW = new Date(2026, 2, 15, 12).getTime();
  const staleRow = { trxId: 'transaction-1', transactionRevision: 9, status: 'REWARDED' };
  const otherRow = { trxId: 'transaction-2', transactionRevision: 3 };
  const listResponse = (content: Array<Record<string, unknown>>) =>
    ({
      content,
      pageNo: 0,
      pageSize: 10,
      totalElements: content.length,
      totalPages: 1,
    } as unknown as MerchantTransactionsListDTO);

  const recordInvoiceUpdate = () =>
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 10,
      invoice: { docNumber: 'DOC-10', filename: 'invoice.pdf' },
      now: NOW,
    });

  beforeEach(() => {
    sessionStorage.clear();
  });

  it.each([
    ['2026-03', true],
    ['2026-03-01', true],
    ['2026-02', false],
    ['2026-04', false],
    ['2025-03', false],
    [undefined, undefined],
    ['', undefined],
    ['2026-13', undefined],
    ['invalid', undefined],
  ])('isCurrentBatchMonth(%p) returns %p', (batchMonth, expected) => {
    expect(isCurrentBatchMonth(batchMonth as string | undefined, NOW)).toBe(expected);
  });

  it('merges the invoice into a stale row of a current-month batch', () => {
    recordInvoiceUpdate();

    const response = reconcileProcessedTransactions(
      'initiative-1',
      listResponse([staleRow, otherRow]),
      NOW,
      'list-test',
      { batchMonth: '2026-03' }
    );

    expect(response.content).toEqual([
      {
        ...staleRow,
        status: 'INVOICED',
        invoiceData: { docNumber: 'DOC-10', filename: 'invoice.pdf' },
      },
      otherRow,
    ]);
    expect(getPendingTransactionState('initiative-1', 'transaction-1', NOW)).toBeDefined();
  });

  it.each(['2026-02', '2026-04'])(
    'suppresses a stale invoice-updated row of a non-current-month batch (%s)',
    (batchMonth) => {
      recordInvoiceUpdate();

      const response = reconcileProcessedTransactions(
        'initiative-1',
        listResponse([staleRow, otherRow]),
        NOW,
        'list-test',
        { batchMonth }
      );

      expect(response.content).toEqual([otherRow]);
      expect(response.totalElements).toBe(2);
      expect(getPendingTransactionState('initiative-1', 'transaction-1', NOW)).toBeDefined();
    }
  );

  it('falls back to merging the invoice when the batch month is unknown', () => {
    recordInvoiceUpdate();

    const response = reconcileProcessedTransactions(
      'initiative-1',
      listResponse([staleRow]),
      NOW
    );

    expect(response.content?.[0]).toMatchObject({
      status: 'INVOICED',
      invoiceData: { docNumber: 'DOC-10', filename: 'invoice.pdf' },
    });
  });

  it('shows the caught-up API row in a non-current-month batch', () => {
    recordInvoiceUpdate();
    const caughtUpRow = { ...staleRow, transactionRevision: 10 };

    const response = reconcileProcessedTransactions(
      'initiative-1',
      listResponse([caughtUpRow]),
      NOW,
      'list-test',
      { batchMonth: '2026-02' }
    );

    expect(response.content).toEqual([caughtUpRow]);
    expect(getPendingTransactionState('initiative-1', 'transaction-1', NOW)).toBeUndefined();
  });

  it('suppresses a stale reversal row regardless of the batch month', () => {
    recordPendingTransactionState({
      initiativeId: 'initiative-1',
      transactionId: 'transaction-1',
      operation: 'reversal',
      effect: 'reversal',
      expectedTransactionRevision: 10,
      now: NOW,
    });

    const response = reconcileProcessedTransactions(
      'initiative-1',
      listResponse([staleRow, otherRow]),
      NOW,
      'list-test',
      { batchMonth: '2026-03' }
    );

    expect(response.content).toEqual([otherRow]);
  });
});
