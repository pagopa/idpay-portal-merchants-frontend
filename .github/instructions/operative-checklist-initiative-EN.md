# ✅ MULTI‑INITIATIVE OPERATIONAL CHECKLIST

> 📎 This checklist aims to keep the multi‑initiative architecture aligned with the rules defined in copilot-instructions  
> .github\instructions\copilot-instructions.md  
> All checks must be consistent with the architecture described in that version.

## Purpose

This checklist must be used:

- ✅ When creating a new multi‑initiative page  
- ✅ When modifying an existing page  
- ✅ During code review  
- ✅ Before a major release  

Goal:

> Ensure that the multi‑initiative architecture remains deterministic, consistent, and free of state duplication.

---

# 🔎 1️⃣ Route as Source of Truth

- [ ] The page reads `initiativeId` only from:
  - `useCurrentInitiativeId()` or
  - `useParams()`
- [ ] No `initiativeId` is read from Redux  
- [ ] No navigation is driven by Redux state  

✅ Rule:  
> The URL is the only source of initiative context.

---

# 🧱 2️⃣ No DTO Duplication

- [ ] `initiativeSelector` is not used  
- [ ] `selectedInitiative` is not used for domain logic  
- [ ] No complete `InitiativeDTO` is stored in Redux  
- [ ] The complete DTO is always derived through:
  ```
  useCurrentInitiative()
  ```

✅ Rule:  
> The domain is derived, not duplicated.

---

# ⚙️ 3️⃣ Deterministic Effects

- [ ] All `useEffect` hooks that perform fetch operations include `initiativeId` in their dependency array  
- [ ] No multi‑initiative fetch uses an empty dependency array `[]`  
- [ ] No effect depends on legacy state  

✅ Rule:  
> Every effect must be deterministic with respect to the route.

---

# 🔄 4️⃣ State Reset on Initiative Change

- [ ] Local states are reset when `initiativeId` changes  
- [ ] No selection remains active  
- [ ] No modal remains open  
- [ ] No data from the previous initiative remains visible  

✅ Rule:  
> No cross‑initiative leakage.

---

# 🧭 5️⃣ Consistent Routing

- [ ] All multi‑initiative routes include `:initiative_id`  
- [ ] All navigation uses:
  ```
  ${BASE_ROUTE}/${initiativeId}/...
  ```
- [ ] No legacy routes exist without the id  

✅ Rule:  
> The architecture is URL‑driven.

---

# 🧪 6️⃣ Consistent Tests

- [ ] Tests do not mock `selectedInitiative` as a complete DTO  
- [ ] Tests mock only the `list`  
- [ ] The DTO is derived in tests via selector  
- [ ] No duplicated snapshots exist in the mock store  

✅ Rule:  
> Tests must reflect the derived architecture.

---

# 🚫 Anti‑Patterns to Avoid

❌ Storing the complete `InitiativeDTO` in Redux  
❌ Using `initiativeSelector` for domain logic  
❌ Performing manual `find()` operations on the initiatives list inside pages  
❌ Fetch effects without `initiativeId`  
❌ UI state that persists across initiatives  

---

# ✅ Current Status (01/04/2026)

Architecture compliant with Multi‑initiative system:

✅ Deterministic  
✅ Without duplication  
✅ With centralized derivation  
✅ With minimal Redux usage  
✅ With consistent routing  

---

# 📌 Recommended Usage

This checklist should be:

- Used as a reference during code reviews  

---

✅ Official multi‑initiative operational document.
