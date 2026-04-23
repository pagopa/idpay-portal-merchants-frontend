import {
  storageTokenOps,
  storageUserOps,
} from '@pagopa/selfcare-common-frontend/lib/utils/storage';

/**
 * Performs local cleanup before redirecting to external logout.
 *
 * Goal: avoid leaking previous-session data (RTK Query cache, redux slices, session storage)
 * when the user comes back to the app after logout/login.
 *
 * Note: keep this function synchronous/best-effort. Logout redirect should always happen.
 */
export const cleanupOnLogout = () => {
  // 1) Auth/session storages used by selfcare-common-frontend
  try {
    storageTokenOps.delete();
  } catch (_) {
    // ignore
  }
  try {
    storageUserOps.delete();
  } catch (_) {
    // ignore
  }

  // 2) App-specific sessionStorage keys
  try {
    sessionStorage.removeItem('storesPagination');
  } catch (_) {
    // ignore
  }
};
