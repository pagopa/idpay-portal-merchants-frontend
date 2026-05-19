# ✅ MULTI-INITIATIVE OPERATIVE CHECKLIST  
Repository name: idpay-portal-merchants-frontend  
**Execution date:** dd/mm/yyyy – hh:mm (Europe/Rome)

---

# 📍 DETERMINISTIC ARCHITECTURAL AUDIT PROTOCOL (NO CODE CHANGE)

⚠️ Fundamental rules:

- ❌ No code modifications must be performed.
- ❌ No refactors must be applied.
- ❌ No automatic fixes must be introduced.
- ✅ The activity is strictly architectural audit.
- ✅ Every statement must be supported by verifiable technical evidence.

The report must NOT be written in this file.

It must be generated in:

```
.github/instructions/report-operative-checklist-initiative-EN-DDMMYYYY.md
```

---

# 🎯 DOCUMENT PURPOSE

This document defines a deterministic audit protocol focused on:

- Correct multi-initiative routing
- Determinism of initiativeId as the source of truth
- Absence of domain duplication in the store
- Consistent propagation of initiativeId across architectural layers
- Absence of anti-patterns that could compromise multi-initiative coherence

⚠️ This checklist does NOT extend the functional scope.  
It formalizes, in a deterministic way, the architectural checks required to guarantee initiative consistency.

---

# 🔬 MANDATORY ANALYSIS METHODOLOGY

For each section:

1. A global search across the repository is mandatory.
2. All analyzed files must be explicitly cited.
3. Relevant code snippets must be cited.
4. It is forbidden to declare issues without technical evidence.
5. It is forbidden to declare compliance without concrete verification.
6. Every non-compliance must explicitly reference the violated rule.

---

# 📄 MANDATORY REPORT STRUCTURE

Each report section must follow EXACTLY this structure:

```
# X️⃣ SECTION NAME

## ✅ Checks performed
- detailed list with cited files

## ⚠️ Issues detected
- concise and technical problem description

### Why this is an architectural issue

This section is mandatory if issues are detected.

It must start with:

This behavior may cause:
```

The explanation must explicitly develop:

1. **State duplication**
2. **Silent inconsistency**
3. **Unnecessary coupling**

With reference to the actually analyzed files.

---

# 🔍 MANDATORY GLOBAL SEARCHES (REINFORCED DETERMINISTIC VERSION)

Before compiling the report, global searches must be performed for:

## ✅ React effects and determinism

- useEffect(
- useMemo(
- useCallback(
- []
- eslint-disable-next-line react-hooks/exhaustive-deps

## ✅ Manual domain derivations

- .find(
- .filter(
- .map(
- reduce(
- includes(
- some(

⚠️ Any manual derivation on the initiatives list outside official selectors must be analyzed.

## ✅ initiativeId propagation

- initiativeId
- initiative_id
- useParams(
- useCurrentInitiative
- useCurrentInitiativeId
- currentInitiativeSelector
- setSelectedInitative

## ✅ Routing and navigation

- routes.tsx
- navigate(
- history.push(
- window.location

## ✅ Persistence and alternative state sources

- localStorage
- sessionStorage

## ✅ HTTP layer

- axios(
- fetch(

Evidence must be reported with file references and code snippets.

---

# 🗺️ SEQUENTIAL CONTROL ROADMAP

---

# 1️⃣ ROUTING ANALYSIS (SOURCE OF TRUTH)

## ✅ Mandatory checks

- All multi-initiative pages include `:initiative_id`.
- Uniform pattern `${BASE_ROUTE}/:initiative_id/...`.
- No legacy routes without parameter.
- No Redux-driven navigation.
- No silent fallback to hardcoded initiativeId.

## ✅ Deterministic rule

> The URL is the only source of initiative context.

PASS if:
- All multi-initiative routes include the parameter.
- No initiativeId derived from store is used as primary source.

---

# 2️⃣ REDUX STATE ANALYSIS (DERIVED DOMAIN)

## ✅ Mandatory checks

- The initiatives list is the only primary domain source.
- Total absence of persisted derived state (e.g., selectedInitative or equivalents).
- No extended DTOs stored in Redux.
- No route → store synchronization actions.
- Consistent use of `currentInitiativeSelector`.

## ✅ Deterministic rule

> The domain must be derived, not duplicated.

PASS if:
- No store property replicates a selected initiative.
- Domain is always derived via selector.

---

# 3️⃣ INITIATIVE ID PROPAGATION ACROSS LAYERS

## ✅ Mandatory checks

- Service layer receives initiativeId as explicit parameter.
- No service reads initiativeId from store or global context.
- No API client invoked without initiativeId when required.
- No HTTP calls in components or guards.

## ✅ Deterministic rule

> initiativeId must be explicitly propagated across layers.

PASS if:
- initiativeId is explicitly passed in multi-initiative domain functions.
- No intermediate layer performs implicit derivations.

---

# 4️⃣ EFFECT ANALYSIS (DETERMINISM)

## ✅ Mandatory checks

- All multi-initiative fetches include initiativeId in dependencies.
- No useEffect with empty dependency array in multi-initiative context.
- No manual `find` on initiatives outside official selectors.
- No domain formatting outside memoized selectors.

## ✅ Deterministic rule

> Every effect must be deterministic with respect to the route.

PASS if:
- Every relevant useEffect includes initiativeId.
- No manual domain derivation inside components.

---

# 5️⃣ INITIATIVE GUARD ANALYSIS

Mandatory file:
`src/decorators/withInitiativeGuard.tsx`

## ✅ Mandatory checks

- initiativeId read exclusively from route.
- No route → store synchronization.
- No domain logic (no find, no mapping).
- No knowledge of internal DTO structure beyond existence validation.

## ✅ Deterministic rule

> Validation must be centralized and must not duplicate domain logic.

---

# 6️⃣ SERVICE AND API LAYER ANALYSIS

## ✅ Mandatory checks

- No HTTP calls outside `src/api` or `src/services`.
- No direct axios or fetch usage in components.
- Consistent use of `axiosInstance`.
- Consistent use of `ApiError`.

## ✅ Deterministic rule

> The HTTP layer must be centralized and isolated from the UI.

PASS if:
- No axios/fetch imports exist outside authorized layers.

---

# 7️⃣ UI STATE RESET ANALYSIS

## ✅ Mandatory checks

- Changing initiativeId triggers proper local state reset.
- No cross-initiative leakage.
- No persistent local cache left invalidated.

## ✅ Deterministic rule

> No cross-initiative leakage is allowed.

---

# 8️⃣ TEST ANALYSIS

## ✅ Mandatory checks

- Tests must not depend on persisted derived state.
- No mock of selectedInitative as primary source.
- Tests must reflect the derived domain model.

## ✅ Deterministic rule

> Tests must be consistent with the derived architecture.

---

# 9️⃣ GLOBAL ANTI-PATTERN VERIFICATION

The following must be ABSENT:

- Manual find on initiatives outside selectors.
- Duplicated state in Redux.
- Route → Redux synchronization actions.
- Hardcoded initiativeId.
- Effects without initiativeId.
- HTTP calls inside components.
- initiativeId read from localStorage as primary source.

---

# ✅ DETERMINISTIC OUTCOME CRITERIA

The report must end with:

```
# ✅ CONCLUSION
```

### POSITIVE RESULT

```
No architectural non-compliances documented with technical evidence were identified.

OUTCOME: *** POSITIVE ***
```

### NEGATIVE RESULT

```
Architectural non-compliances documented with technical evidence were identified.

OUTCOME: *** NEGATIVE ***

List of files to be modified:
1 - path/file1
2 - path/file2
```

⚠️ "Partially aligned" is not allowed.

---

✅ This document constitutes the official deterministic multi-initiative audit protocol, including routing verification, derived domain enforcement, and architectural propagation of initiativeId.
