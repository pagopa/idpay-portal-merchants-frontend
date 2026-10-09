Playwright end-to-end tests for the merchant portal.

Local state-bridge tests

1. Install dependencies and Playwright browsers:

```bash
yarn install
yarn playwright install chromium
```

2. Run the deterministic local suite:

```bash
yarn test:e2e tests/e2e/specs/transactionStateBridge.spec.ts
```

The Playwright configuration starts `yarn start` automatically and mocks the portal APIs.
The tests cover stale invoice reconciliation, stale reversal suppression, equal-revision
cleanup, and rows without a server revision. The local fixture also mocks the OneTrust and
font resources and blocks unexpected external HTTP requests, so no internet connection is
required after dependencies and the Chromium browser have been installed.

To watch the test step by step, use the Playwright Inspector:

```bash
yarn test:e2e:debug tests/e2e/specs/transactionStateBridge.spec.ts \
  -g "suppresses a stale reversal row"
```

The Inspector opens Chromium in headed mode and provides Resume, Pause, and Step over
controls. For continuous slow motion without pausing, use either
`PLAYWRIGHT_SLOWMO_MS` or `PLAYWRIGHT_SLOWMO`:

```bash
PLAYWRIGHT_SLOWMO_MS=500 yarn test:e2e:headed \
  tests/e2e/specs/transactionStateBridge.spec.ts --workers=1
```

External-environment tests

The postpone-transaction spec targets a running portal environment. Set these variables
before running it:

- `PLAYWRIGHT_BASE_URL` — portal base URL
- `PLAYWRIGHT_INITIATIVE_ID` — initiative ID
- `PLAYWRIGHT_BATCH_ID` — reward batch ID
- `PLAYWRIGHT_TRX_ID` — transaction ID
- `PLAYWRIGHT_SHOP_DETAILS_URL` — optional full shop-details URL

Run the external test:

```bash
yarn test:e2e tests/e2e/specs/postponeTransaction.spec.ts --project=chromium
```

Notes

- The spec expects a page that exposes elements with data-test-id `refund-amount` and `batch-label`.
- Adjust the network route pattern in the spec to match your backend endpoint for the postpone action.
