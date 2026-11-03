import { Page, Route } from '@playwright/test';
import { RewardBatchTrxStatus } from '../../../src/api/generated/merchants/data-contracts';
import type {
  InitiativeDTO,
  MerchantDetailDTO,
  MerchantTransactionDTO,
  MerchantTransactionsListDTO,
  RewardBatchDTO,
} from '../../../src/api/generated/merchants/data-contracts';

export const INITIATIVE_ID = 'initiative-e2e';
export const BATCH_ID = 'batch-e2e';
export const TRANSACTION_ID = 'transaction-e2e';
export const MERCHANT_ID = 'merchant-e2e';

export const SHOP_DETAILS_PATH = `/portale-esercenti/${INITIATIVE_ID}/richieste-di-rimborso/${BATCH_ID}`;

const STORAGE_KEY_PREFIX = 'idpay:merchant-transaction-state-bridge:';
const LOCAL_PLAYWRIGHT_BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
const LOCAL_PLAYWRIGHT_ORIGIN = new URL(LOCAL_PLAYWRIGHT_BASE_URL).origin;
const SELFCARE_FONT_ORIGIN = 'https://selfcare.pagopa.it';
const SELFCARE_FONT_PATH = '/assets/font/selfhostedfonts.css';
const isLocalPlaywrightRun = !process.env.PLAYWRIGHT_BASE_URL;

export type PendingTransactionSeed = {
  operation: 'invoice-update' | 'reversal';
  effect: 'invoice' | 'reversal';
  expectedTransactionRevision: number;
  invoice?: {
    docNumber?: string;
    filename?: string;
  };
};

export const getBridgeStorageKey = (initiativeId: string, transactionId: string): string =>
  `${STORAGE_KEY_PREFIX}${encodeURIComponent(initiativeId)}:${encodeURIComponent(transactionId)}`;

export const installLocalAuth = async (page: Page): Promise<void> => {
  await page.addInitScript(
    ({ payload }) => {
      const nativeAtob = window.atob.bind(window);

      // eslint-disable-next-line functional/immutable-data
      Object.defineProperty(window, 'atob', {
        configurable: true,
        value: (value: string) => (value ? nativeAtob(value) : JSON.stringify(payload)),
      });
    },
    {
      payload: {
        uid: 'e2e-user',
        name: 'E2E',
        family_name: 'Merchant',
        email: 'e2e@example.com',
        org_id: MERCHANT_ID,
        org_name: 'E2E Merchant',
        org_vat: 'IT00000000000',
        org_party_role: 'ADMIN',
        org_role: 'admin',
      },
    }
  );
};

export const seedPendingTransactionState = async (
  page: Page,
  seed: PendingTransactionSeed
): Promise<void> => {
  await page.addInitScript(
    ({ initiativeId, transactionId, pendingState, storageKey }) => {
      const now = Date.now();
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          schemaVersion: 1,
          initiativeId,
          transactionId,
          ...pendingState,
          createdAt: now,
          expiresAt: now + 30_000,
        })
      );
    },
    {
      initiativeId: INITIATIVE_ID,
      transactionId: TRANSACTION_ID,
      pendingState: seed,
      storageKey: getBridgeStorageKey(INITIATIVE_ID, TRANSACTION_ID),
    }
  );
};

export const buildTransaction = (
  overrides: Partial<MerchantTransactionDTO> = {}
): MerchantTransactionDTO => ({
  trxCode: 'E2E123',
  trxId: TRANSACTION_ID,
  transactionRevision: 3,
  fiscalCode: 'AAAAAA00A00A000A',
  effectiveAmountCents: 20_000,
  rewardAmountCents: 2_000,
  rewardBatchId: BATCH_ID,
  rewardBatchTrxStatus: RewardBatchTrxStatus.CONSULTABLE,
  rewardBatchInclusionDate: '2026-01-01T10:00:00Z',
  franchiseName: 'E2E Shop',
  pointOfSaleType: 'PHYSICAL',
  businessName: 'E2E Merchant',
  trxDate: '2026-01-01T10:00:00Z',
  updateDate: '2026-01-01T10:00:00Z',
  status: 'INVOICED',
  channel: 'BAR_CODE',
  additionalProperties: {
    productName: 'E2E Product',
  },
  pointOfSaleId: 'pos-e2e',
  trxChargeDate: '2026-01-01T10:00:00Z',
  authorizedAmountCents: 20_000,
  invoiceData: {
    docNumber: 'OLD-001',
    filename: 'old-invoice.pdf',
  },
  ...overrides,
});

const defaultInitiative: InitiativeDTO = {
  initiativeId: INITIATIVE_ID,
  initiativeName: 'Bonus Elettrodomestici',
  organizationName: 'E2E Merchant',
  status: 'PUBLISHED',
  startDate: '2025-01-01',
  endDate: '2026-12-31',
};

const defaultBatch: RewardBatchDTO = {
  id: BATCH_ID,
  merchantId: MERCHANT_ID,
  businessName: 'E2E Merchant',
  month: '2026-01',
  posType: 'PHYSICAL',
  status: 'CREATED',
  name: 'Lotto gennaio 2026',
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-01-31T23:59:59Z',
  initialAmountCents: 20_000,
  approvedAmountCents: 0,
  suspendedAmountCents: 0,
  numberOfTransactions: 1,
};

const defaultMerchantDetail: MerchantDetailDTO = {
  initiativeId: INITIATIVE_ID,
  initiativeName: 'Bonus Elettrodomestici',
  businessName: 'E2E Merchant',
  iban: 'IT60X0542811101000000123456',
  ibanHolder: 'E2E Merchant',
};

const fulfillJson = async (route: Route, body: unknown, status = 200): Promise<void> => {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
};

export type MerchantPortalMockOptions = {
  initiative?: InitiativeDTO;
  batch?: RewardBatchDTO;
  merchantDetail?: MerchantDetailDTO;
  transactions?: Array<MerchantTransactionDTO>;
};

export const installMerchantPortalMocks = async (
  page: Page,
  options: MerchantPortalMockOptions = {}
): Promise<void> => {
  const initiative = options.initiative ?? defaultInitiative;
  const batch = options.batch ?? defaultBatch;
  const merchantDetail = options.merchantDetail ?? defaultMerchantDetail;
  const transactions = options.transactions ?? [buildTransaction()];
  const processedTransactions: MerchantTransactionsListDTO = {
    content: transactions,
    pageNo: 0,
    pageSize: 10,
    totalElements: transactions.length,
    totalPages: transactions.length ? 1 : 0,
  };

  if (isLocalPlaywrightRun) {
    await page.route('**/*', async (route) => {
      const requestUrl = new URL(route.request().url());

      if (
        requestUrl.origin === SELFCARE_FONT_ORIGIN &&
        requestUrl.pathname === SELFCARE_FONT_PATH
      ) {
        await route.fulfill({
          status: 200,
          contentType: 'text/css',
          body: '',
        });
        return;
      }

      if (
        (requestUrl.protocol === 'http:' || requestUrl.protocol === 'https:') &&
        requestUrl.origin !== LOCAL_PLAYWRIGHT_ORIGIN
      ) {
        await route.abort('blockedbyclient');
        return;
      }

      await route.fallback();
    });
  }

  await page.route('**/e2e-api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname } = url;

    if (pathname.endsWith('/one-trust/scripttemplates/otSDKStub.js')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: 'window.OnetrustActiveGroups = "";',
      });
      return;
    }

    if (pathname.endsWith('/one-trust/notice.js')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: '',
      });
      return;
    }

    if (pathname.endsWith('/one-trust/privacy.json') || pathname.endsWith('/one-trust/tos.json')) {
      await fulfillJson(route, {});
      return;
    }

    if (pathname.endsWith('/role-permission/consent')) {
      await fulfillJson(route, {});
      return;
    }

    if (pathname.endsWith('/role-permission/permissions')) {
      await fulfillJson(route, { role: 'admin', permissions: [] });
      return;
    }

    if (pathname.endsWith('/merchants-portal/initiatives')) {
      await fulfillJson(route, [initiative]);
      return;
    }

    if (pathname.endsWith(`/merchants-portal/initiatives/${INITIATIVE_ID}`)) {
      await fulfillJson(route, merchantDetail);
      return;
    }

    if (
      pathname.endsWith(`/merchants-portal/initiatives/${INITIATIVE_ID}/reward-batches/${BATCH_ID}`)
    ) {
      await fulfillJson(route, batch);
      return;
    }

    if (pathname.endsWith(`/merchants-portal/point-of-sales/${BATCH_ID}`)) {
      await fulfillJson(route, [
        {
          franchiseName: 'E2E Shop',
          pointOfSaleId: 'pos-e2e',
        },
      ]);
      return;
    }

    if (
      pathname.endsWith(`/merchants-portal/initiatives/${INITIATIVE_ID}/transactions/processed`)
    ) {
      await fulfillJson(route, processedTransactions);
      return;
    }

    throw new Error(`Unhandled local E2E API request: ${request.method()} ${request.url()}`);
  });
};
