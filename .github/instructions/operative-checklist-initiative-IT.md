# ✅ CHECKLIST OPERATIVA MULTINIZIATIVA

> 📎 Questa checklist cerca di mantere la multi iniziativa in linea con le regole  copilot-instructions
>.github\instructions\copilot-instructions.md
> Tutte le verifiche devono essere coerenti con l’architettura descritta in tale versione.

## Scopo

Questa checklist deve essere utilizzata:

- ✅ Quando si crea una nuova pagina multiniziativa
- ✅ Quando si modifica una pagina esistente
- ✅ Durante code review
- ✅ Prima di una release importante

Obiettivo:

> Garantire che l’architettura multiniziativa rimanga deterministica, coerente e senza duplicazione di stato.

---

# 🔎 1️⃣ Route come Source of Truth

- [ ] La pagina legge `initiativeId` solo da:
  - `useCurrentInitiativeId()` oppure
  - `useParams()`
- [ ] Nessun `initiativeId` viene letto da Redux
- [ ] Nessuna navigazione è guidata da stato Redux

✅ Regola:
> L’URL è l’unica fonte del contesto iniziativa.

---

# 🧱 2️⃣ Nessuna Duplicazione DTO

- [ ] Non viene usato `initiativeSelector`
- [ ] Non viene usato `selectedInitative` per logica dominio
- [ ] Nessun `InitiativeDTO` completo viene salvato nello store
- [ ] Il DTO completo viene sempre derivato tramite:
  ```
  useCurrentInitiative()
  ```

✅ Regola:
> Il dominio è derivato, non duplicato.

---

# ⚙️ 3️⃣ Effetti Deterministici

- [ ] Tutti i `useEffect` che fanno fetch includono `initiativeId` nelle dependency
- [ ] Nessun fetch multiniziativa usa dependency `[]`
- [ ] Nessun effetto dipende da stato legacy

✅ Regola:
> Ogni effetto deve essere deterministico rispetto alla route.

---

# 🔄 4️⃣ Reset Stato su Cambio Iniziativa

- [ ] Gli stati locali vengono resettati al cambio `initiativeId`
- [ ] Nessuna selezione rimane attiva
- [ ] Nessun modal rimane aperto
- [ ] Nessun dato della precedente iniziativa rimane visibile

✅ Regola:
> Nessun leakage cross‑iniziativa.

---

# 🧭 5️⃣ Routing Coerente

- [ ] Tutte le rotte multiniziativa includono `:initiative_id`
- [ ] Tutte le navigation usano:
  ```
  ${BASE_ROUTE}/${initiativeId}/...
  ```
- [ ] Non esistono rotte legacy senza id

✅ Regola:
> L’architettura è URL‑driven.

---

# 🧪 6️⃣ Test Coerenti

- [ ] I test non mockano `selectedInitative` come DTO completo
- [ ] I test mockano solo `list`
- [ ] Il DTO viene derivato nel test tramite selector
- [ ] Non esistono snapshot duplicati nel mock store

✅ Regola:
> I test devono riflettere l’architettura derivata.

---

# 🚫 Anti‑Pattern da Evitare

❌ Salvare `InitiativeDTO` completo in Redux  
❌ Usare `initiativeSelector` per logica dominio  
❌ Fare `find()` manuali sulla lista iniziative nelle pagine  
❌ Effetti di fetch senza `initiativeId`  
❌ Stato UI che persiste tra iniziative  

---

# ✅ Stato Attuale (01/04/2026)

Architettura conforme a Sistema multiniziativa:

✅ Deterministico  
✅ Senza duplicazione  
✅ Con derivazione centralizzata  
✅ Con Redux minimal  
✅ Con routing coerente  

---

# 📌 Uso Consigliato

Questa checklist deve essere:
- Usata come riferimento durante le code review

---

✅ Documento operativo ufficiale multiniziativa.
