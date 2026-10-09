import { expect, test } from '@playwright/test';
import {
  buildTransaction,
  getBridgeStorageKey,
  INITIATIVE_ID,
  installLocalAuth,
  installMerchantPortalMocks,
  seedPendingTransactionState,
  SHOP_DETAILS_PATH,
  TRANSACTION_ID,
} from '../fixtures/merchantPortal';

const openShopDetails = async (page: Parameters<typeof installLocalAuth>[0]): Promise<void> => {
  await page.goto(SHOP_DETAILS_PATH);
  await expect(page.getByRole('heading', { name: 'Lotto gennaio 2026' })).toBeVisible();
};

test.describe('Transaction state bridge', () => {
  test('merges pending invoice data while the processed-list row is stale', async ({ page }) => {
    await installLocalAuth(page);
    await seedPendingTransactionState(page, {
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 4,
      invoice: {
        docNumber: 'NEW-004',
        filename: 'new-invoice.pdf',
      },
    });
    await installMerchantPortalMocks(page, {
      transactions: [
        buildTransaction({
          transactionRevision: 3,
          invoiceData: {
            docNumber: 'OLD-003',
            filename: 'old-invoice.pdf',
          },
        }),
      ],
    });

    await openShopDetails(page);

    await expect(page.getByText('new-invoice.pdf')).toBeVisible();
    await expect(page.getByText('old-invoice.pdf')).not.toBeVisible();

    const pendingState = await page.evaluate(
      (storageKey) => sessionStorage.getItem(storageKey),
      getBridgeStorageKey(INITIATIVE_ID, TRANSACTION_ID)
    );
    expect(pendingState).not.toBeNull();
  });

  test('suppresses a stale reversal row without changing the server pagination response', async ({
    page,
  }) => {
    await installLocalAuth(page);
    await seedPendingTransactionState(page, {
      operation: 'reversal',
      effect: 'reversal',
      expectedTransactionRevision: 4,
    });
    await installMerchantPortalMocks(page, {
      transactions: [buildTransaction({ transactionRevision: 3 })],
    });

    const processedTransactionsResponse = page.waitForResponse((response) =>
      response
        .url()
        .includes(`/merchants-portal/initiatives/${INITIATIVE_ID}/transactions/processed`)
    );
    await openShopDetails(page);
    const processedTransactionsPayload = await processedTransactionsResponse;
    expect((await processedTransactionsPayload.json()).totalElements).toBe(1);

    await expect(page.getByText('Nessuna richiesta di rimborso trovata.')).toBeVisible();

    const pendingState = await page.evaluate(
      (storageKey) => sessionStorage.getItem(storageKey),
      getBridgeStorageKey(INITIATIVE_ID, TRANSACTION_ID)
    );
    expect(pendingState).not.toBeNull();
  });

  test('shows the server row unchanged and clears pending state at an equal revision', async ({
    page,
  }) => {
    await installLocalAuth(page);
    await seedPendingTransactionState(page, {
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 4,
      invoice: {
        docNumber: 'PENDING-004',
        filename: 'pending-invoice.pdf',
      },
    });
    await installMerchantPortalMocks(page, {
      transactions: [
        buildTransaction({
          transactionRevision: 4,
          invoiceData: {
            docNumber: 'SERVER-004',
            filename: 'server-invoice.pdf',
          },
        }),
      ],
    });

    await openShopDetails(page);

    await expect(page.getByText('server-invoice.pdf')).toBeVisible();
    await expect(page.getByText('pending-invoice.pdf')).not.toBeVisible();

    const pendingState = await page.evaluate(
      (storageKey) => sessionStorage.getItem(storageKey),
      getBridgeStorageKey(INITIATIVE_ID, TRANSACTION_ID)
    );
    expect(pendingState).toBeNull();
  });

  test('shows API data without an overlay when the row has no revision', async ({ page }) => {
    await installLocalAuth(page);
    await seedPendingTransactionState(page, {
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: 4,
      invoice: {
        docNumber: 'PENDING-004',
        filename: 'pending-invoice.pdf',
      },
    });
    await installMerchantPortalMocks(page, {
      transactions: [
        buildTransaction({
          transactionRevision: undefined,
          invoiceData: {
            docNumber: 'SERVER-003',
            filename: 'server-invoice.pdf',
          },
        }),
      ],
    });

    await openShopDetails(page);

    await expect(page.getByText('server-invoice.pdf')).toBeVisible();
    await expect(page.getByText('pending-invoice.pdf')).not.toBeVisible();

    const pendingState = await page.evaluate(
      (storageKey) => sessionStorage.getItem(storageKey),
      getBridgeStorageKey(INITIATIVE_ID, TRANSACTION_ID)
    );
    expect(pendingState).not.toBeNull();
  });
});
