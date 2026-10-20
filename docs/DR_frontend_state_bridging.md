# Design review: bridging stale transaction reads

**Status:** Approved for a bounded UX workaround  
**Decision:** Use the authoritative `transactionRevision` to reconcile a short-lived
presentation overlay. Do not describe the overlay as strong consistency or as a permanent
read-after-write guarantee.

## Problem

The merchant portal can return to the processed-transaction list after either of these
successful mutations:

- `PUT /initiatives/{initiativeId}/transactions/{transactionId}/invoice/update`
- `POST /initiatives/{initiativeId}/transactions/{transactionId}/reversal-invoiced`

Both currently return `204 No Content`. The subsequent processed-list read may be served
by a lagging projection, so the user can briefly see the pre-mutation state.

The backend returns the resulting `transactionRevision` in a response header after a
successful mutation, and the processed-list row exposes the same field. The frontend must
carry the header value into the pending record and compare it with the row returned by the
list API.

## Challenge to the proposal

The original proposal is too confident about a client-side solution:

1. **A structural match is not reconciliation.** Matching status, filename, or document
   number cannot prove that the read model contains this mutation. Another operator may
   have changed the transaction, and a missing row may simply be outside the current page
   or filter.
2. **A browser overlay can hide valid server state.** Reversal suppression can hide a
   later update, and invoice merging can overwrite a newer value. A TTL limits the damage;
   it does not make the result correct.
3. **`transactionRevision` solves the freshness problem only when its contract is explicit.**
   The mutation header and processed-list projection must expose the same authoritative
   per-transaction version.
4. **The TTL is an operational parameter.** Use 30 seconds initially, monitor expirations,
   and revisit the value using observed CDC latency. It must not become an unexplained
   permanent constant.
5. **The current key-scope assumption is unsafe.** Do not rely on an undocumented claim
   that `trxId` is globally unique. Scope records by `initiativeId` and `trxId`, and clear
   them on logout.

If the product requires a strict read-your-own-writes guarantee, the frontend overlay is
still the wrong boundary. The bridge is a bounded presentation aid; the backend remains
authoritative.

## Recommendation

### 1. Use `transactionRevision` as the freshness contract

The backend contract is:

- a successful invoice update or reversal returns the resulting `transactionRevision` in
  the agreed response header;
- the processed-list row returns that same per-transaction revision;
- the revision is monotonic within a transaction, is not reused for two accepted states
  of that transaction, and a read at version `N` includes accepted changes through `N`.
- when the processed-list API returns a row at a revision equal to or newer than the
  pending revision, that API row is authoritative and must replace the pending view.
- revision values remain at or below `Number.MAX_SAFE_INTEGER`, so the generated
  JavaScript `number` representation is safe.

The API client must expose the header to `merchantService`; the frontend must not calculate
`current + 1`, use a timestamp, or invent a client revision. A missing or invalid header
is a contract failure: do not create a pending record with a fabricated value.

The generated transaction client already returns the full HTTP response, including headers,
but `MerchantsApiClient` currently discards that response and returns `void` for both
mutations. The implementation must:

- make `MerchantsApiClient.updateInvoiceTransaction` and
  `MerchantsApiClient.reversalTransactionInvoiced` return a typed, validated
  `transactionRevision` to `merchantService`;
- keep pending-record creation in `merchantService`, not in generated clients or
  `FileUploadAction`;
- preserve successful mutation behavior when the header is missing or invalid: do not
  create an overlay, show API data, and emit a diagnostic if required;
- add wrapper and service tests for valid, missing, malformed, and out-of-order revisions.

### 2. Keep the bridge small and operation-specific

Keep the bridge limited to:

- invoice update;
- reversal of an invoiced transaction;
- the merchant processed-list read.

Record pending state in one typed helper at the `merchantService` boundary, after the
mutation succeeds. Keep `FileUploadAction` generic. Apply the helper to the raw
`MerchantTransactionDTO` before UI formatting.

The pending record should contain only:

- schema version;
- `initiativeId` and `transactionId`;
- operation and effect;
- expected `transactionRevision` returned by the mutation header;
- the minimum invoice metadata needed for the UI;
- creation and expiration information.

Never store the uploaded `File` or unrelated transaction data in `sessionStorage`. Treat
stored values as untrusted: validate, discard malformed values, and degrade to the server
response if storage is unavailable. If storage access fails, do not block the mutation or
list request: show the API data without an overlay. If the mutation header is missing or
invalid, also show the API data without creating a pending record because the frontend
cannot know when the projection has caught up.

For the same initiative and transaction, replace the existing pending record only when the
incoming `transactionRevision` is greater than or equal to the stored revision. An
out-of-order response with a lower revision must be ignored and must never replace newer
pending state. Do not build a client-side mutation queue.

### 3. Define the two effects precisely

**Invoice update**

- If the processed-list row revision is lower than the expected revision, the API row is
  stale: keep the sessionStorage entry and merge only the expected `status: INVOICED` and
  invoice `docNumber`/`filename`.
- When the row revision is equal to or greater than expected, remove the sessionStorage
  entry and show the API row unchanged.
- If the row has no `transactionRevision`, show the API row without an overlay and keep the
  pending entry only until its TTL expires.
- Do not overwrite fields unrelated to the upload.

**Reversal**

- If the processed-list row revision is lower than the expected revision, the API row is
  stale: keep the sessionStorage entry and suppress the matching row from the
  processed-list content.
- Do not fabricate a row, change `totalElements`, reorder the page, or merge reversal
  document fields.
- When the row revision is equal to or greater than expected, remove the sessionStorage
  entry and show the API response. If the row is still returned, do not suppress current
  server data indefinitely; treat the reversal postcondition as a backend/projection
  contract failure or show an explicit pending state.
- If a returned row has no `transactionRevision`, show the API response without an overlay
  and keep the pending entry only until its TTL expires.
- If the row is absent, keep the sessionStorage entry until its TTL expires. There is no
  reliable frontend signal that distinguishes propagation from filtering, pagination, or
  another list transition.

Do not make structural matching the normal fallback. Without a valid revision, use the
normal API response without an overlay.

### 4. Make expiration and isolation explicit

Use a 30-second TTL for the initial implementation. Treat it as provisional: monitor
expiration frequency against CDC latency and adjust it later if evidence requires. On
expiration:

1. remove the pending record;
2. render the backend response;
3. show a non-blocking synchronization message if reverting the optimistic view would
   confuse users;
4. emit only a privacy-safe diagnostic if monitoring is needed.

`sessionStorage` is tab-local, best-effort, and readable by JavaScript in the origin. It is
acceptable only for short-lived presentation metadata. The namespace must include the
initiative and transaction; cleanup must be best-effort during logout and must never block
logout. Cross-tab convergence is not provided and must not be implied.

## Scope boundaries

- Do not add cancellation, authorization, or a generic mutation queue without a verified
  read-model postcondition.
- Keep postpone outside this bridge. It changes reward-batch membership and the existing
  flow refetches after success; revisit it only if that contract is shown to be
  asynchronous.
- Do not modify server pagination totals, insert synthetic rows, or make Redux/route state
  the source of initiative context. Use the route-derived `initiativeId`. A suppressed
  reversal may temporarily leave a page shorter than requested; this is accepted.
- Do not solve overlapping list-request cancellation in this bridge. It is an existing
  loader concern and should be handled separately if prioritized.
- Do not change generated DTOs by hand. Update the OpenAPI contract and regenerate clients.

## Repository integration points

- `src/api/MerchantsApiClient.ts`: extract and validate `X-Transaction-Revision` from the
  successful mutation response.
- `src/services/merchantService.ts`: record successful mutations and transform the
  processed-list response.
- `src/pages/FileUploadAction/FileUploadAction.tsx`: remain a generic upload/navigation
  component.
- `src/utils/logoutCleanup.ts`: remove the bridge namespace during logout.
- `src/api/generated/`: regenerate after any contract change.

## Decision gates and minimum tests

Implementation is not ready until these conditions are verified:

1. The mutation header is exposed to the browser and returned by
   `MerchantsApiClient` as a validated revision.
2. The initial 30-second TTL and expiry UX are agreed, including the accepted TTL-based
   cleanup for a reversal whose row disappears.
3. It is acceptable for storage failures and missing headers to show API data without an
   overlay.

At minimum, tests must prove that:

- successful invoice and reversal mutations create records with the header revision, while
  failed mutations or missing headers create none;
- an equal or higher revision replaces the pending record, while a lower out-of-order
  revision is ignored;
- a list row with a lower revision keeps the pending entry and applies only the expected
  invoice fields;
- a list row with an equal or higher revision removes the entry and is shown unchanged;
- a row without a revision is shown from the API without an overlay;
- stale reversal rows are suppressed without changing counts, ordering, or creating rows;
- an absent reversal row remains pending for 30 seconds, then falls back to API data;
- missing, malformed, unavailable, and expired storage safely fall back to server data;
- a newer server state is never overwritten by an older overlay;
- suppressing a reversal may shorten the visible page without changing server totals;
- logout removes pending records and a later login cannot inherit them.

## Final decision

Implement one small, typed, transaction-scoped overlay for invoice update and reversal.
Record the authoritative revision from the successful-operation header; while the list row
is behind, keep the session entry and show the expected state. Once the row reaches that
revision, remove the session entry and show the API data. Keep the expiry policy explicit
and treat any unresolved state as uncertainty, not as consistency.
