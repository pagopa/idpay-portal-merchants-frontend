// DEPRECATO: la matrice ruolo -> azioni disabilitate e' ora definita in
// `src/locale/it/default/config.json` (chiave `roles`) e letta dall'hook
// `src/hooks/useUserPermissions.ts`, che espone anche le costanti `PERMISSION_KEYS`.
//
// Questo file resta come re-export di compatibilita' per eventuali import residui
// e puo' essere rimosso senza impatto una volta verificato che nessuno lo importi.
export { PERMISSION_KEYS } from '../hooks/useUserPermissions';
export type { PermissionKey } from '../hooks/useUserPermissions';
