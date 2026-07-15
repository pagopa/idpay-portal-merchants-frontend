import { useMemo } from 'react';
import config from '../locale/it/default/config.json';
import { useIDPayUser } from './useIDPayUser';

/**
 * Chiavi delle azioni gestite dalla matrice permessi.
 * Devono restare allineate con `roles.subRoles.<role>.permissions.disabledActions`
 * definiti in `src/locale/it/default/config.json`.
 */
export const PERMISSION_KEYS = {
  // Iniziative
  INITIATIVE_ADHERE: 'initiative.adhere',
  INITIATIVE_NEW_TAB: 'initiative.newTab',

  // Catalogo Punti Vendita
  POS_CATALOG_ASSOCIATE: 'posCatalog.associate',
  POS_CATALOG_EXCLUDE: 'posCatalog.exclude',

  // Panoramica iniziativa
  OVERVIEW_EDIT_EMAIL: 'overview.editEmail',
  OVERVIEW_EDIT_IBAN: 'overview.editIban',
  OVERVIEW_UPLOAD_STORES: 'overview.uploadStores',

  // Punti vendita (dentro iniziativa)
  STORES_ADD: 'stores.add',
  STORE_DETAIL_EDIT_REFERENT: 'storeDetail.editReferent',

  // Storico transazioni PV / dettaglio lotti
  TRANSACTION_REVERSE: 'transaction.reverse',
  TRANSACTION_MODIFY_DOC: 'transaction.modifyDoc',
  TRANSACTION_POSTPONE: 'transaction.postpone',

  // Richieste di rimborso
  REFUND_SEND_BATCH: 'refund.sendBatch',

  // Segnalazione utenti
  REPORTED_USER_REPORT: 'reportedUser.report',
  REPORTED_USER_DELETE: 'reportedUser.delete',

  // Esporta report
  REPORT_GENERATE: 'report.generate',
} as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

type SubRoleConfig = {
  logicalName?: string;
  permissions?: { disabledActions?: Array<string> };
};

type RolesConfig = {
  name?: string;
  logicalName?: string;
  subRoles?: Record<string, SubRoleConfig>;
};

const rolesConfig: RolesConfig = (config as { roles?: RolesConfig }).roles ?? {};

const getDisabledActionsForRole = (role: string | undefined | null): Set<string> => {
  if (!role) {
    return new Set();
  }
  const normalized = role.toLowerCase();
  const actions = rolesConfig.subRoles?.[normalized]?.permissions?.disabledActions ?? [];
  return new Set(actions);
};

/**
 * Hook che espone le capability dell'utente loggato in base al claim `org_role`
 * del JWT (gia' salvato in Redux tramite `userActions.setLoggedUser`).
 *
 * La matrice ruolo -> azioni disabilitate e' definita in
 * `src/locale/it/default/config.json` sotto `roles.subRoles.<role>.permissions.disabledActions`.
 */
export const useUserPermissions = () => {
  const user = useIDPayUser();
  const role = user?.org_role;

  return useMemo(() => {
    const disabledActions = getDisabledActionsForRole(role);
    const subRole = role ? rolesConfig.subRoles?.[role.toLowerCase()] : undefined;
    return {
      role,
      logicalRoleName: subRole?.logicalName,
      isSupportUser: (role ?? '').toLowerCase() === 'support',
      /** Ritorna `true` se l'azione e' disabilitata per il ruolo dell'utente. */
      isActionDisabled: (action: PermissionKey) => disabledActions.has(action),
    };
  }, [role]);
};
