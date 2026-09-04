/* eslint-disable functional/immutable-data */
import { disableAnalytics, initAnalytics } from './services/analyticsService';

// const ANALYTICS_COOKIE_GROUP = 'C0002';
const ANALYTICS_COOKIE_GROUP = 'C0001'; // test

type AnalyticsWindow = Window & {
  OneTrust?: {
    OnConsentChanged?: (callback: () => void) => void;
  };
  OnetrustActiveGroups?: string;
  OptanonWrapper?: () => void;
};

const analyticsWindow = window as AnalyticsWindow;
let consentListenerRegistered = false;

const hasAnalyticsConsent = () =>
  (analyticsWindow.OnetrustActiveGroups ?? '')
    .split(',')
    .map((group) => group.trim())
    .includes(ANALYTICS_COOKIE_GROUP);

const synchronizeAnalyticsConsent = () => {
  if (hasAnalyticsConsent()) {
    initAnalytics();
  } else {
    disableAnalytics();
  }
};

const registerConsentListener = () => {
  synchronizeAnalyticsConsent();

  if (!consentListenerRegistered && analyticsWindow.OneTrust?.OnConsentChanged) {
    analyticsWindow.OneTrust.OnConsentChanged(synchronizeAnalyticsConsent);
    consentListenerRegistered = true;
  }
};

const previousOptanonWrapper = analyticsWindow.OptanonWrapper;
analyticsWindow.OptanonWrapper = () => {
  previousOptanonWrapper?.();
  registerConsentListener();
};

if (analyticsWindow.OneTrust?.OnConsentChanged) {
  registerConsentListener();
}
