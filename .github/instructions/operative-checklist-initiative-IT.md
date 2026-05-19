# ✅ CHECKLIST OPERATIVA MULTINIZIATIVA  
Nome repository: idpay-portal-merchants-frontend  
**Data esecuzione: ** gg/mm/aaaa – hh:mm (Europe/Rome)

---

# 📍 PROTOCOLLO DI AUDIT ARCHITETTURALE DETERMINISTICO (NO CODE CHANGE)

⚠️ Regole fondamentali:

- ❌ Non devono essere effettuate modifiche al codice.
- ❌ Non devono essere applicati refactor.
- ❌ Non devono essere introdotti fix automatici.
- ✅ L’attività è esclusivamente di audit architetturale.
- ✅ Ogni affermazione deve essere supportata da evidenza tecnica verificabile.

Il report NON deve essere inserito in questo file.

Deve essere generato in:

```
.github/instructions/report-operative-checklist-initiative-IT-GGMMAAAA.md
```

---

# 🎯 SCOPO DEL DOCUMENTO

Questo documento definisce un protocollo di audit deterministico focalizzato su:

- Correttezza del routing multiniziativa
- Determinismo dell’initiativeId come source of truth
- Assenza di duplicazione dominio nello store
- Propagazione coerente dell’initiativeId nei layer architetturali
- Assenza di anti‑pattern che possano compromettere la coerenza multiniziativa

⚠️ La checklist NON amplia lo scope funzionale.  
Formalizza in modo deterministico i controlli architetturali necessari a garantire coerenza dell’iniziativa.

---

# 🔬 METODOLOGIA OBBLIGATORIA DI ANALISI

Per ogni sezione:

1. È obbligatoria ricerca globale nella repository.
2. È obbligatoria citazione dei file analizzati.
3. È obbligatoria citazione di snippet di codice rilevanti.
4. È vietato dichiarare criticità senza evidenza tecnica.
5. È vietato dichiarare conformità senza verifica concreta.
6. Ogni non conformità deve citare esplicitamente la regola violata.

---

# 📄 STRUTTURA OBBLIGATORIA DEL REPORT

Ogni sezione del report deve avere ESATTAMENTE questa struttura:

```
# X️⃣ NOME SEZIONE

## ✅ Verifiche effettuate
- elenco puntuale con file citati

## ⚠️ Criticità rilevate
- descrizione sintetica e tecnica del problema

### Perché è un problema architetturale

Questa sezione è obbligatoria in presenza di criticità.

Deve iniziare obbligatoriamente con:

Questo comportamento può causare:
```

La spiegazione deve sviluppare in modo esplicito:

1. **Duplicazione di stato**
2. **Incoerenza silenziosa**
3. **Accoppiamento non necessario**

Con riferimento ai file realmente analizzati.

---

# 🔍 RICERCHE GLOBALI OBBLIGATORIE (VERSIONE RAFFORZATA DETERMINISTICA)

Prima di compilare il report devono essere effettuate ricerche globali per:

## ✅ Effetti e determinismo React

- useEffect(
- useMemo(
- useCallback(
- []
- eslint-disable-next-line react-hooks/exhaustive-deps

## ✅ Derivazioni manuali dominio

- .find(
- .filter(
- .map(
- reduce(
- includes(
- some(

⚠️ Qualsiasi derivazione manuale su lista iniziative fuori dai selector ufficiali deve essere analizzata.

## ✅ Propagazione initiativeId

- initiativeId
- initiative_id
- useParams(
- useCurrentInitiative
- useCurrentInitiativeId
- currentInitiativeSelector
- setSelectedInitative

## ✅ Routing e navigazione

- routes.tsx
- navigate(
- history.push(
- window.location

## ✅ Persistenza e fonti alternative di stato

- localStorage
- sessionStorage

## ✅ Layer HTTP

- axios(
- fetch(

Le evidenze devono essere riportate nel report con citazione file e snippet.

---

# 🗺️ ROADMAP SEQUENZIALE DI CONTROLLO

---

# 1️⃣ ANALISI ROUTING (SOURCE OF TRUTH)

## ✅ Verifiche obbligatorie

- Tutte le pagine multiniziativa includono `:initiative_id`.
- Uniformità del pattern `${BASE_ROUTE}/:initiative_id/...`.
- Nessuna rotta legacy senza parametro.
- Nessuna navigazione guidata da Redux.
- Nessun fallback silenzioso a initiativeId hardcoded.

## ✅ Regola deterministica

> L’URL è l’unica fonte del contesto iniziativa.

PASS se:
- Tutte le rotte multiniziativa contengono il parametro.
- Nessun utilizzo di initiativeId derivato da store come fonte primaria.

---

# 2️⃣ ANALISI STATO REDUX (DOMINIO DERIVATO)

## ✅ Verifiche obbligatorie

- Presenza di lista iniziative come unica fonte primaria del dominio.
- Assenza totale di stato derivato persistito (es. selectedInitative o equivalenti).
- Assenza di DTO estesi salvati nello store.
- Assenza di azioni route → store.
- Utilizzo coerente di `currentInitiativeSelector`.

## ✅ Regola deterministica

> Il dominio deve essere derivato, non duplicato.

PASS se:
- Non esiste alcuna proprietà di stato che replichi un’iniziativa selezionata.
- Il dominio viene sempre derivato via selector.

---

# 3️⃣ PROPAGAZIONE DELL’INITIATIVE ID NEI LAYER

## ✅ Verifiche obbligatorie

- I service layer ricevono initiativeId come parametro esplicito.
- Nessun service legge initiativeId da store o contesto globale.
- Nessun client API viene invocato senza initiativeId quando richiesto.
- Nessuna chiamata HTTP in componenti o guard.

## ✅ Regola deterministica

> L’initiativeId deve essere propagato in modo esplicito lungo i layer.

PASS se:
- initiativeId è parametro esplicito nelle funzioni di dominio multiniziativa.
- Nessun layer intermedio effettua derivazioni implicite.

---

# 4️⃣ ANALISI EFFETTI (DETERMINISMO)

## ✅ Verifiche obbligatorie

- Tutti i fetch multiniziativa includono initiativeId nelle dependency.
- Nessun useEffect con dependency `[]` in contesto multiniziativa.
- Nessun `find` manuale su iniziative fuori dai selector ufficiali.
- Nessuna formattazione dominio fuori da selector memoizzati.

## ✅ Regola deterministica

> Ogni effetto deve essere deterministico rispetto alla route.

PASS se:
- Ogni useEffect coinvolto nel dominio include initiativeId.
- Nessuna derivazione manuale nel componente.

---

# 5️⃣ ANALISI GUARD INIZIATIVA

File obbligatorio:
`src/decorators/withInitiativeGuard.tsx`

## ✅ Verifiche obbligatorie

- Lettura initiativeId esclusivamente da route.
- Nessuna sincronizzazione route → store.
- Nessuna logica dominio (no find, no mapping).
- Nessuna conoscenza della struttura interna del DTO oltre alla validazione esistenza.

## ✅ Regola deterministica

> La validazione deve essere centralizzata e non duplicare dominio.

---

# 6️⃣ ANALISI SERVICE E API LAYER

## ✅ Verifiche obbligatorie

- Nessuna chiamata HTTP fuori da `src/api` o `src/services`.
- Nessun utilizzo diretto di axios o fetch in componenti.
- Utilizzo coerente di `axiosInstance`.
- Utilizzo coerente di `ApiError`.

## ✅ Regola deterministica

> Il layer HTTP deve essere centralizzato e isolato dalla UI.

PASS se:
- Non esistono import axios/fetch fuori dai layer consentiti.

---

# 7️⃣ ANALISI RESET STATO UI

## ✅ Verifiche obbligatorie

- Cambio initiativeId comporta reset coerente degli stati locali.
- Nessun leakage cross‑iniziativa.
- Nessuna cache locale persistente non invalidata.

## ✅ Regola deterministica

> Nessun leakage cross‑iniziativa è ammesso.

---

# 8️⃣ ANALISI TEST

## ✅ Verifiche obbligatorie

- I test non dipendono da stato derivato persistito.
- Nessun mock di selectedInitative come fonte primaria.
- I test riflettono il modello derivato.

## ✅ Regola deterministica

> I test devono essere coerenti con l’architettura derivata.

---

# 9️⃣ VERIFICA ANTI‑PATTERN GLOBALI

Devono risultare ASSENTI:

- find manuali su iniziative fuori dai selector.
- Stato duplicato nello store.
- Action di sincronizzazione route → Redux.
- initiativeId hardcoded.
- Effetti senza initiativeId.
- Chiamate HTTP in componenti.
- Lettura initiativeId da localStorage come fonte primaria.

---

# ✅ CRITERI DETERMINISTICI DI ESITO

Il report deve terminare obbligatoriamente con:

```
# ✅ CONCLUSIONE
```

### ESITO POSITIVO

```
Non sono state identificate non conformità architetturali documentate con evidenza tecnica.

ESITO: *** POSITIVO ***
```

### ESITO NEGATIVO

```
Sono state identificate non conformità architetturali documentate con evidenza tecnica.

ESITO: *** NEGATIVO ***

Elenco file da modificare:
1 - percorso/file1
2 - percorso/file2
```

⚠️ Non è ammesso "parzialmente allineato".

---

✅ Questo documento costituisce protocollo ufficiale di audit multiniziativa deterministico, comprensivo di verifica routing, dominio derivato e propagazione architetturale dell’initiativeId.
