import { useMemo } from 'react';
import config from '../locale/it/default/config.json';
import { useIDPayUser } from './useIDPayUser';

export const PERMISSION_KEYS = {
  INITIATIVE_ADHERE: 'initiative.adhere',
  INITIATIVE_NEW_TAB: 'initiative.newTab',

  POS_CATALOG_ASSOCIATE: 'posCatalog.associate',
  POS_CATALOG_EXCLUDE: 'posCatalog.exclude',

  OVERVIEW_EDIT_EMAIL: 'overview.editEmail',
  OVERVIEW_EDIT_IBAN: 'overview.editIban',
  OVERVIEW_UPLOAD_STORES: 'overview.uploadStores',

  STORES_ADD: 'stores.add',
  STORE_DETAIL_EDIT_REFERENT: 'storeDetail.editReferent',

  TRANSACTION_REVERSE: 'transaction.reverse',
  TRANSACTION_MODIFY_DOC: 'transaction.modifyDoc',
  TRANSACTION_POSTPONE: 'transaction.postpone',

  REFUND_SEND_BATCH: 'refund.sendBatch',

  REPORTED_USER_REPORT: 'reportedUser.report',
  REPORTED_USER_DELETE: 'reportedUser.delete',

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
      isActionDisabled: (action: PermissionKey) => disabledActions.has(action),
    };
  }, [role]);
};
