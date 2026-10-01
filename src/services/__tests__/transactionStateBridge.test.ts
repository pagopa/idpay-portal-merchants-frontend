import {
  clearPendingTransactionStates,
  getPendingTransactionState,
  reconcileProcessedTransactions,
  recordPendingTransactionState,
  removePendingTransactionState,
  TRANSACTION_STATE_BRIDGE_TTL_MS,
} from '../transactionStateBridge';
import { MerchantTransactionsListDTO } from '../../api/generated/merchants/data-contracts';

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

    expect(response.content).toEqual([row]);
    expect(getPendingTransactionState('initiative-1', 'transaction-1', 100)).toBeDefined();
    expect(
      getPendingTransactionState(
        'initiative-1',
        'transaction-1',
        100 + TRANSACTION_STATE_BRIDGE_TTL_MS
      )
    ).toBeUndefined();
  });

  it('discards malformed values and clears all bridge records on logout', () => {
    const key = 'idpay:merchant-transaction-state-bridge:initiative-1:transaction-1';
    sessionStorage.setItem(key, '{malformed');

    expect(getPendingTransactionState('initiative-1', 'transaction-1')).toBeUndefined();
    expect(sessionStorage.getItem(key)).toBeNull();

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
  });

  it('does not fail when storage is unavailable', () => {
    const originalSessionStorage = global.sessionStorage;

    delete (global as any).sessionStorage;

    expect(() =>
      recordPendingTransactionState({
        initiativeId: 'initiative-1',
        transactionId: 'transaction-1',
        operation: 'reversal',
        effect: 'reversal',
        expectedTransactionRevision: 10,
      })
    ).not.toThrow();

    global.sessionStorage = originalSessionStorage;
  });

  afterEach(() => {
    removePendingTransactionState('initiative-1', 'transaction-1');
  });
});
