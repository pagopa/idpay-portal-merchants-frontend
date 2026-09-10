import mixpanel, {
  type AutocaptureConfig,
  type Config,
  type Mixpanel,
} from 'mixpanel-browser';
import { browserConsole } from '../utils/consoleLogger';

const AUTOCAPTURE_CONFIG: AutocaptureConfig = {
  pageview: false,
  click: true,
  input: true,
  submit: true,
  dead_click: true,
  rage_click: true,
  scroll: false,
  capture_text_content: false,
  block_selectors: ['.mp-no-track'],
};

const MIXPANEL_CONFIG: Partial<Config> = {
  api_host: process.env.REACT_APP_MIXPANEL_API_HOST || 'https://api-eu.mixpanel.com',
  debug: process.env.REACT_APP_MIXPANEL_DEBUG === 'true',
  persistence: 'localStorage',
  persistence_name: 'idpay-merchants-analytics',
  opt_out_tracking_cookie_prefix: '__mp_idpay_merchants_analytics_',
  autocapture: AUTOCAPTURE_CONFIG,
  track_pageview: false,
  ip: false,
  property_blacklist: [
    '$current_url',
    '$initial_referrer',
    '$referrer',
    'current_url_search',
  ],
  record_sessions_percent: 0,
  record_heatmap_data: false,
};

let analyticsInstance: Mixpanel | undefined;
let analyticsActive = false;

export const MIXPANEL_EVENTS = {
  BONUS_ACCEPTANCE_SUCCESS: 'IDPAY_BONUS_ACCEPTANCE_UX_SUCCESS',
  BONUS_ACCEPTANCE_DENIED: 'IDPAY_BONUS_ACCEPTANCE_UX_DENIED',
  NEW_STORES_SUCCESS: 'IDPAY_NEW_STORES_UX_SUCCESS',
  ADD_STORE_CONVERSION: 'IDPAY_ADD_STORE_UX_CONVERSION',
  ADD_STORE_ERROR: 'IDPAY_ADD_STORE_ERROR',
  ADD_STORE_SUCCESS: 'IDPAY_ADD_STORE_UX_SUCCESS',
  LOAD_INVOICE_START: 'IDPAY_LOAD_INVOICE_UX_START_FLOW',
  LOAD_INVOICE_SUCCESS: 'IDPAY_LOAD_INVOICE_UX_SUCCESS',
  LOAD_INVOICE_ERROR: 'IDPAY_LOAD_INVOICE_ERROR',
  INVOICE_SENT_SUCCESS: 'IDPAY_INVOICE_SENT_UX_SUCCESS',
  INVOICE_SENT_ERROR: 'IDPAY_INVOICE_SENT_ERROR',
  IBAN_SUCCESS: 'IDPAY_IBAN_UX_SUCCESS',
  IBAN_UPDATE_SUCCESS: 'IDPAY_IBAN_UPDATE_SUCCESS',
  OPERATIVE_EMAIL_SUCCESS: 'IDPAY_EMAIL_UX_SUCCESS',
  OPERATIVE_EMAIL_UPDATE_SUCCESS: 'IDPAY_EMAIL_UPDATE_UX_SUCCESS',
} as const;

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export const trackAnalyticsPageView = (pathname: string) => {
  if (!analyticsInstance || !analyticsActive) {
    return;
  }

  analyticsInstance.track_pageview({
    current_url_path: pathname,
  });
};

export const trackAnalyticsEvent = (
  eventName: (typeof MIXPANEL_EVENTS)[keyof typeof MIXPANEL_EVENTS],
  properties?: AnalyticsProperties
) => {
  if (!analyticsInstance || !analyticsActive) {
    return;
  }

  analyticsInstance.track(eventName, properties);
};

const INITIATIVE_ANALYTICS_PROPERTIES = ['initiative_name', 'initiative_id'] as const;

export const clearInitiativeAnalyticsProperties = () => {
  if (!analyticsInstance || !analyticsActive) {
    return;
  }

  INITIATIVE_ANALYTICS_PROPERTIES.forEach((propertyName) => {
    analyticsInstance?.unregister(propertyName);
  });
};

export const registerInitiativeAnalyticsProperties = (
  initiativeName?: string,
  initiativeId?: string
) => {
  if (!analyticsInstance || !analyticsActive || !initiativeName || !initiativeId) {
    return;
  }

  analyticsInstance.register({
    initiative_name: initiativeName,
    initiative_id: initiativeId,
  });
};

export const syncInitiativeAnalyticsProperties = (
  initiativeName?: string,
  initiativeId?: string
) => {
  clearInitiativeAnalyticsProperties();

  if (!analyticsInstance || !analyticsActive) {
    return;
  }

  if (initiativeId) {
    analyticsInstance.register({ initiative_id: initiativeId });
  }

  if (initiativeName) {
    analyticsInstance.register({ initiative_name: initiativeName });
  }
};

const resumeAnalytics = (instance: Mixpanel) => {
  if (instance.has_opted_out_tracking()) {
    instance.clear_opt_in_out_tracking();
    instance.set_config({ autocapture: AUTOCAPTURE_CONFIG });
  }
  analyticsActive = true;
};

export const initAnalytics = () => {
  if (process.env.REACT_APP_MIXPANEL_ENABLE !== 'true') {
    return;
  }

  if (analyticsInstance) {
    if (!analyticsActive) {
      resumeAnalytics(analyticsInstance);
    }
    return;
  }

  const mixpanelToken = process.env.REACT_APP_MIXPANEL_TOKEN;
  if (!mixpanelToken) {
    browserConsole.warn(
      '[Mixpanel] Missing REACT_APP_MIXPANEL_TOKEN: analytics initialization skipped.'
    );
    return;
  }

  analyticsInstance = mixpanel.init(
    mixpanelToken,
    MIXPANEL_CONFIG,
    'analytics'
  );
  resumeAnalytics(analyticsInstance);
};

export const disableAnalytics = () => {
  if (analyticsInstance && analyticsActive) {
    analyticsInstance.opt_out_tracking();
    analyticsActive = false;
  }
};
