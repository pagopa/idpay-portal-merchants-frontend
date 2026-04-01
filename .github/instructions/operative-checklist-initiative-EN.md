# ✅ MULTI‑INITIATIVE OPERATIONAL CHECKLIST  
Repository name: idpay-portal-merchants-frontend  
**Execution date: ** dd/mm/yyyy – hh:mm (Europe/Rome)

## 📍 DETERMINISTIC ARCHITECTURAL AUDIT PROTOCOL (NO CODE CHANGE)

---

# 🎯 PURPOSE OF THE DOCUMENT

This document defines a **deterministic architectural audit protocol** for the repository:

`idpay-portal-merchants-frontend`

⚠️ Fundamental rules:

- ❌ No code modifications must be performed.
- ❌ No refactors must be applied.
- ❌ No automatic fixes must be introduced.
- ✅ The activity is strictly architectural audit.
- ✅ Every statement must be supported by technical evidence.

The report must NOT be written inside this file.

It must be generated in:

```
.github/instructions/report-operative-checklist-initiative-EN-GGMMAAAA.md
```

⚠️ The generated report MUST be written entirely in English.

---

# 🔬 MANDATORY ANALYSIS METHODOLOGY

For every section:

1. A global search across the repository is mandatory.
2. An explicit citation of analyzed files is mandatory.
3. Relevant code snippets must be quoted.
4. Declaring issues without technical evidence is forbidden.
5. Declaring compliance without concrete verification is forbidden.
6. Every non‑compliance must explicitly reference the violated rule.

---

# 📄 MANDATORY REPORT STRUCTURE

Each report section must have EXACTLY the following structure:

```
# X️⃣ SECTION NAME

## ✅ Checks performed
- detailed list with cited files

## ⚠️ Issues detected
- concise and technical description of the issue (e.g. derived DTO synchronization into the store)
- manual `find` usage if present
- any non‑compliant pattern detected

### Why this is an architectural problem

This section is mandatory when issues are detected.

The explanation MUST NOT be short or generic.  
It must be structured, technical, and maintenance‑oriented.

It must explicitly start with:

```
This behavior may cause:
```

And it must clearly and contextually develop:

1. **State duplication**
   - Specify where the data already exists (e.g. `list`)
   - Specify where it is duplicated (e.g. `selectedInitative`)
   - Clearly explain why two potentially divergent sources of truth are created
   - Explicitly describe the concrete architectural risk

2. **Silent inconsistency**
   - Explain what happens in case of refetch or state refresh
   - Identify which state can become stale
   - Describe the impact on components consuming that state
   - Highlight the risk of inconsistencies that are not immediately visible

3. **Unnecessary coupling**
   - Explain which downstream components may start depending on the duplicated state
   - Describe the regression risk toward a non‑derived architecture
   - Highlight the increase in technical debt or maintenance complexity

⚠️ The list must be:
- Dynamic
- Specific to the detected issue
- Contextualized to the actual analyzed files
- Clear for developers during maintenance

⚠️ Short lists such as:

```
1. Domain duplication
2. Stale state
3. Redux coupling
```

are NOT allowed.

The explanation must always be expanded as in the following example:

```
This behavior may cause:

1. State duplication
   - The initiative already exists in `list`
   - A derived copy is saved into `selectedInitative`
   - Two potentially divergent sources of truth

2. Silent inconsistency
   - If `list` is updated (refetch), `selectedInitative` may remain stale
   - Components reading from the store may receive inconsistent data

3. Unnecessary coupling
   - Downstream components may start depending on `selectedInitative`
   - Risk of regression toward non‑derived architecture
```

## ❌ Architectural non‑compliance
Violated rule:
> explicitly cite the violated protocol rule

Technical evidence:
```
real detected code snippet
```
```

Generic or purely descriptive reports are not allowed.

---

# 🔍 MANDATORY GLOBAL SEARCHES

Before drafting the report, global searches must be performed for:

- selectedInitative
- InitiativeDTO
- find(
- useEffect(
- dependency []
- initiativeId
- useParams(
- currentInitiativeSelector
- setSelectedInitative
- routes.tsx

All findings must be documented in the report.

---

# 🗺️ SEQUENTIAL CONTROL ROADMAP

---

# 1️⃣ ROUTING ANALYSIS (SOURCE OF TRUTH)

### Mandatory checks

- All multi‑initiative pages include `:initiative_id`.
- Uniform pattern `${BASE_ROUTE}/:initiative_id/...`.
- No legacy routes without the parameter.
- No navigation driven by Redux.

### Required evidence

- Citation of `routes.tsx`
- Complete list of multi‑initiative routes
- Evidence of any non‑uniform patterns

✅ Rule:
> The URL is the only source of initiative context.

---

# 2️⃣ REDUX STATE ANALYSIS

### Mandatory checks

- Presence of initiatives list as primary source.
- Absence of storing complete initiative DTO as primary source.
- Absence of domain duplication.
- Verification of `selectedInitative` usage.
- Verification of `currentInitiativeSelector` presence.

### Required evidence

- Citation of Redux slice
- Citation of guard
- Citation of any dispatch

✅ Rule:
> The domain must be derived, not duplicated.

---

# 3️⃣ EFFECTS ANALYSIS (DETERMINISM)

### Mandatory checks

- All multi‑initiative fetches include `initiativeId` in dependency arrays.
- No `useEffect` with dependency `[]` in multi‑initiative context.
- No manual `find` outside memoized selector.

### Required evidence

- Citation of analyzed `useEffect`
- Evidence of dependency arrays

✅ Rule:
> Every effect must be deterministic with respect to the route.

---

# 4️⃣ UI STATE RESET ANALYSIS

### Mandatory checks

- Verification of local state reset on `initiativeId` change.
- Verification of absence of cross‑initiative leakage.
- Verification of presence or absence of a global reset mechanism.

✅ Rule:
> No cross‑initiative leakage.

---

# 5️⃣ INITIATIVE GUARD ANALYSIS

Mandatory file to analyze:
`src/decorators/withInitiativeGuard.tsx`

### Mandatory checks

- `initiativeId` is read only from the route.
- No derived DTO synchronization into the store.
- No manual `find` outside selector.
- No domain duplication.

✅ Rule:
> Validation must be centralized and must not duplicate domain logic.

---

# 6️⃣ TEST ANALYSIS

### Mandatory checks

- Tests must not depend on persisted derived state.
- No mocking of `selectedInitative` as primary source.
- Consistency with derived model.

✅ Rule:
> Tests must reflect the derived architecture.

---

# 7️⃣ GLOBAL ANTI‑PATTERN VERIFICATION

### Mandatory checks

- No manual `find` on initiatives outside selector.
- No domain duplication in Redux.
- No effect without `initiativeId`.
- No non‑uniform route.

---

# ✅ DETERMINISTIC OUTCOME CRITERIA

The report must mandatorily end with the following chapter:

```
# ✅ CONCLUSION
```

### In case of POSITIVE OUTCOME

```
# ✅ CONCLUSION

No architectural non‑compliance has been identified with documented technical evidence.

OUTCOME: *** POSITIVE ***
```

### In case of NEGATIVE OUTCOME

```
# ✅ CONCLUSION

Architectural non‑compliance has been identified and documented with technical evidence.

OUTCOME: *** NEGATIVE ***

List of files to be modified:
1 - `path/to/file1`
2 - `path/to/file2`
...
```

⚠️ The list of files to be modified must be:
- Numbered.
- Dynamic.
- Strictly aligned with the actual non‑compliance identified in the report.
- Based exclusively on technical evidence cited in previous sections.

"Partially aligned" is not allowed.

---

✅ This document constitutes the official deterministic multi‑initiative audit protocol.
