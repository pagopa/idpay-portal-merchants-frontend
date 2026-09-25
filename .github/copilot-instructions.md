# Copilot Instructions

## Tooling

- Use Yarn (the repository has `yarn.lock`) and Node `16.10.0` from `.nvmrc`.
- Start the application with `yarn start`; create a production build with `yarn build`.
- Run all Jest tests with `yarn test --watchAll=false`. Run one test file with, for example, `yarn test --watchAll=false --testPathPattern=src/services/__tests__/merchantService.test.ts`.
- Run coverage and the Sonar-compatible results processor with `yarn test:coverage`.
- Lint TypeScript and TSX with `yarn lint`; it writes `eslint-report.json`. Apply lint fixes with `yarn lint-autofix`. Format TS and TSX with `yarn prettify`.
- Regenerate all OpenAPI clients with `yarn generate`. The source specifications are in `openApi/`; generated clients live in `src/api/generated/` and must be regenerated rather than hand-edited.

## Architecture

- `src/index.js` loads `src/bootstrap.tsx`. Bootstrap configures PagoPA Selfcare environment values, consent/analytics, Italian i18n, and renders `App` beneath Redux, React Router v5, and the PagoPA MUI theme providers.
- `App.tsx` separates the public `/auth` page from secured routes. Secured content is wrapped by `withLogin`, then `withSelectedPartyProducts`, and rendered within the shared `Layout`. Add protected pages to `routes.tsx` and register them in the `Switch` in `App.tsx`.
- Initiative-scoped routes use `:initiative_id`. The URL is the sole initiative-context source: obtain it with `useCurrentInitiativeId`, derive its data through `currentInitiativeSelector`/`useCurrentInitiative`, and protect initiative pages with `WithInitiativeGuard`. Do not persist a selected initiative, synchronize route state into Redux, or navigate from Redux state.
- The store combines Selfcare's `user` and `appState` slices with local party, permission, and initiative slices. `initiativesApi` is deliberately in bridge mode: it adds RTK Query caching/deduplication but updates `initiativesSlice`, which remains the authoritative initiative list for existing components.
- API calls flow from pages/hooks through `src/services/` into the API-client wrappers in `src/api/`. Client wrappers use `BaseApiClient` for authenticated requests, common error handling, and environment-specific base URLs. Keep generated DTOs at the API boundary; use services to provide UI-facing operations.

## Repository Conventions

- `ENV` in `src/utils/env.ts` requires the documented `REACT_APP_*` variables at module load. Do not replace it with ad hoc `process.env` access or commit local environment values.
- TypeScript is strict and disallows unused locals, unused parameters, implicit returns, and implicit `any`. Prettier uses single quotes, semicolons, 100-column lines, and ES5 trailing commas.
- ESLint enforces import ordering and immutable data. Redux Toolkit reducer mutations are the established exception, scoped with the existing `functional/immutable-data` disable. Avoid unrelated rule disables.
- Place focused Jest tests beside their feature in `__tests__`; use `renderWithContext` from `src/utils/__tests__/test-utils.tsx` when a component needs the Redux store, Router, and theme. Mock service/client seams rather than generated DTO modules.
- The multi-initiative audit protocol in `.github/instructions/operative-checklist-initiative-EN.md` is authoritative when the task is an architectural audit. Its core rules are that initiative domain data is derived from the route and the list, route-dependent effects are deterministic, and UI state must not leak across initiatives.
