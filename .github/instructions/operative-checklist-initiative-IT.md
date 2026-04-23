# ✅ CHECKLIST OPERATIVA MULTINIZIATIVA  
Nome repository: idpay-portal-merchants-frontend  
**Data esecuzione: ** gg/mm/aaaa – hh:mm (Europe/Rome)

## 📍 PROTOCOLLO DI AUDIT ARCHITETTURALE DETERMINISTICO (NO CODE CHANGE)

---

# 🎯 SCOPO DEL DOCUMENTO

Questo documento definisce un **protocollo di audit architetturale deterministico** per la repository:

`idpay-portal-merchants-frontend`

⚠️ Regole fondamentali:

- ❌ Non devono essere effettuate modifiche al codice.
- ❌ Non devono essere applicati refactor.
- ❌ Non devono essere introdotti fix automatici.
- ✅ L’attività è esclusivamente di audit architetturale.
- ✅ Ogni affermazione deve essere supportata da evidenza tecnica.

Il report NON deve essere inserito in questo file.

Deve essere generato in:

```
.github/instructions/report-operative-checklist-initiative-IT-GGMMAAAA.md
```

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
- descrizione sintetica e tecnica del problema (es. sincronizzazione DTO derivato nello store)
- eventuale uso di `find` manuale
- pattern non conforme rilevato

### Perché è un problema architetturale

Questa sezione è obbligatoria in presenza di criticità.

La spiegazione NON può essere sintetica o generica.  
Deve essere articolata, tecnica e manutentiva.

Deve iniziare obbligatoriamente con:

```
Questo comportamento può causare:
```

E deve sviluppare in modo esplicito e contestualizzato:

1. **Duplicazione di stato**
   - Indicare dove il dato esiste già (es. `list`)
   - Indicare dove viene duplicato (es. `selectedInitative`)
   - Spiegare chiaramente perché si creano due fonti di verità potenzialmente divergenti
   - Evidenziare il rischio architetturale concreto

2. **Incoerenza silenziosa**
   - Spiegare cosa accade in caso di refetch o aggiornamento dati
   - Indicare quale stato può rimanere obsoleto
   - Descrivere l’impatto sui componenti che leggono quello stato
   - Evidenziare il rischio di inconsistenza non immediatamente visibile

3. **Accoppiamento non necessario**
   - Spiegare quali componenti downstream potrebbero iniziare a dipendere dallo stato duplicato
   - Descrivere il rischio di regressione verso un’architettura non derivata
   - Evidenziare l’aumento del debito tecnico o della complessità manutentiva

⚠️ L’elenco deve essere:
- Dinamico
- Specifico rispetto alla criticità rilevata
- Contestualizzato ai file realmente analizzati
- Comprensibile per uno sviluppatore in fase di manutenzione

⚠️ Non sono ammessi elenchi brevi del tipo:

```
1. Duplicazione dominio
2. Stato obsoleto
3. Accoppiamento Redux
```

La spiegazione deve sempre essere sviluppata come nell’esempio seguente:

```
Questo comportamento può causare:

1. Duplicazione di stato
   - L’iniziativa è già presente in `list`
   - Viene salvata una copia derivata in `selectedInitative`
   - Due fonti di verità potenzialmente divergenti

2. Incoerenza silenziosa
   - Se `list` viene aggiornata (refetch), `selectedInitative` potrebbe restare obsoleta
   - Componenti che leggono dallo store possono avere dati inconsistenti

3. Accoppiamento non necessario
   - Componenti downstream potrebbero iniziare a dipendere da `selectedInitative`
   - Rischio di regressione verso architettura non derivata
```

## ❌ Non conformità architetturali
Regola violata:
> citare esplicitamente la regola del protocollo

Evidenza tecnica:
```
snippet di codice reale rilevato
```
```

Non sono ammessi report descrittivi o generici.

---

# 🔍 RICERCHE GLOBALI OBBLIGATORIE

Prima di compilare il report devono essere effettuate ricerche globali per:

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

Le evidenze devono essere riportate nel report.

---

# 🗺️ ROADMAP SEQUENZIALE DI CONTROLLO

---

# 1️⃣ ANALISI ROUTING (SOURCE OF TRUTH)

### Verifiche obbligatorie

- Tutte le pagine multiniziativa includono `:initiative_id`.
- Uniformità del pattern `${BASE_ROUTE}/:initiative_id/...`.
- Nessuna rotta legacy senza parametro.
- Nessuna navigazione guidata da Redux.

### Evidenze richieste

- Citazione `routes.tsx`
- Elenco completo rotte multiniziativa
- Evidenza di eventuali pattern non uniformi

✅ Regola:
> L’URL è l’unica fonte del contesto iniziativa.

---

# 2️⃣ ANALISI STATO REDUX

### Verifiche obbligatorie

- Presenza di lista iniziative come unica fonte primaria del dominio.
- Assenza totale di stato derivato persistito (es. `selectedInitative` o equivalenti).
- Assenza di qualsiasi DTO "Extended" salvato nello store.
- Assenza di azioni di sincronizzazione route → store.
- Presenza e utilizzo coerente di `currentInitiativeSelector` come unico punto di derivazione dominio.

### Evidenze richieste

- Citazione slice Redux
- Citazione guard
- Citazione eventuale dispatch

✅ Regola:
> Il dominio deve essere derivato, non duplicato.

---

# 3️⃣ ANALISI EFFETTI (DETERMINISMO)

### Verifiche obbligatorie

- Tutti i fetch multiniziativa includono `initiativeId` nelle dependency.
- Nessun useEffect con dependency `[]` in contesto multiniziativa.
- Nessun `find` o derivazione manuale su iniziative in componenti, guard o useEffect.
- Nessuna logica di formattazione dominio (es. spendingPeriod) fuori dai selector memoizzati.

### Evidenze richieste

- Citazione useEffect analizzati
- Evidenza dependency array

✅ Regola:
> Ogni effetto deve essere deterministico rispetto alla route.

---

# 4️⃣ ANALISI RESET STATO UI

### Verifiche obbligatorie

- Verifica reset stati locali al cambio initiativeId.
- Verifica assenza leakage cross‑iniziativa.
- Verifica presenza o assenza meccanismo globale di reset.

✅ Regola:
> Nessun leakage cross‑iniziativa.

---

# 5️⃣ ANALISI GUARD INIZIATIVA

File obbligatorio da analizzare:
`src/decorators/withInitiativeGuard.tsx`

### Verifiche obbligatorie

- Lettura initiativeId esclusivamente da route.
- Nessuna sincronizzazione imperativa route → store.
- Nessuna derivazione dominio nel guard (no `find`, no formattazioni, no logica DTO).
- Nessuna conoscenza della struttura interna di InitiativeDTO oltre alla validazione di esistenza.

✅ Regola:
> La validazione deve essere centralizzata e non duplicare dominio.

---

# 6️⃣ ANALISI TEST

### Verifiche obbligatorie

- I test non devono dipendere da stato derivato persistito.
- Nessun mock di selectedInitative come fonte primaria.
- Coerenza con modello derivato.

✅ Regola:
> I test devono riflettere architettura derivata.

---

# 7️⃣ VERIFICA ANTI‑PATTERN GLOBALI

### Verifiche obbligatorie

- Nessun `find` manuale su iniziative fuori dai selector ufficiali.
- Nessuna reintroduzione di stato derivato persistito nello store.
- Nessuna action di sincronizzazione tra route e Redux.
- Nessuna duplicazione dominio in Redux.
- Nessun effetto senza initiativeId.
- Nessuna rotta non uniforme.

---

# ✅ CRITERI DETERMINISTICI DI ESITO

Il report deve terminare obbligatoriamente con il seguente capitolo:

```
# ✅ CONCLUSIONE
```

### In caso di ESITO POSITIVO

```
# ✅ CONCLUSIONE

Non sono state identificate non conformità architetturali documentate con evidenza tecnica.

ESITO: *** POSITIVO ***
```

### In caso di ESITO NEGATIVO

```
# ✅ CONCLUSIONE

Sono state identificate non conformità architetturali documentate con evidenza tecnica.

ESITO: *** NEGATIVO ***

Elenco file da modificare:
1 - `percorso/file1`
2 - `percorso/file2`
...
```

⚠️ L'elenco dei file da modificare deve essere:
- Numerato.
- Dinamico.
- Coerente esclusivamente con le non conformità effettivamente rilevate nel report.
- Basato su evidenza tecnica citata nelle sezioni precedenti.

Non è ammesso "parzialmente allineato".

---

✅ Questo documento costituisce protocollo ufficiale di audit multiniziativa deterministico.
