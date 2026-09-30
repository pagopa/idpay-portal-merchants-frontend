import { useMemo } from 'react';
import { useCurrentInitiative } from './useCurrentInitiative';
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

const INITIATIVE_SCOPED_PERMISSION_KEYS = new Set<PermissionKey>([
  PERMISSION_KEYS.OVERVIEW_EDIT_EMAIL,
  PERMISSION_KEYS.OVERVIEW_EDIT_IBAN,
  PERMISSION_KEYS.OVERVIEW_UPLOAD_STORES,
  PERMISSION_KEYS.STORES_ADD,
  PERMISSION_KEYS.STORE_DETAIL_EDIT_REFERENT,
  PERMISSION_KEYS.TRANSACTION_REVERSE,
  PERMISSION_KEYS.TRANSACTION_MODIFY_DOC,
  PERMISSION_KEYS.TRANSACTION_POSTPONE,
  PERMISSION_KEYS.REFUND_SEND_BATCH,
  PERMISSION_KEYS.REPORTED_USER_REPORT,
  PERMISSION_KEYS.REPORTED_USER_DELETE,
  PERMISSION_KEYS.POS_CATALOG_ASSOCIATE,
  PERMISSION_KEYS.POS_CATALOG_EXCLUDE,
  PERMISSION_KEYS.REPORT_GENERATE,
]);

const isInitiativeEnded = (endDate?: string): boolean => {
  if (!endDate) {
    return false;
  }

  return new Date(endDate).getTime() < Date.now();
};

export const useUserPermissions = () => {
  const user = useIDPayUser();
  const currentInitiative = useCurrentInitiative();
  const role = user?.org_role;

  return useMemo(() => {
    const hasEndedInitiative = isInitiativeEnded(currentInitiative?.endDate);

    return {
      role,
      isActionDisabled: (action: PermissionKey) =>
        (hasEndedInitiative && INITIATIVE_SCOPED_PERMISSION_KEYS.has(action)),
    };
  }, [currentInitiative?.endDate, role]);
};