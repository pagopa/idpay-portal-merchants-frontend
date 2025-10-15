import * as env from 'env-var';

const PUBLIC_URL_INNER: string | undefined = '/portale-esercenti-in-arrivo';
export const ENV = {
  ENV: env.get('REACT_APP_ENV').asString(),
  PUBLIC_URL: PUBLIC_URL_INNER,

  ASSISTANCE: {
    EMAIL: env.get('REACT_APP_PAGOPA_HELP_EMAIL').asString(),
  },

  URL_FE: {
    PRE_LOGIN: env.get('REACT_APP_URL_FE_PRE_LOGIN').asString(),
    LOGIN: env.get('REACT_APP_URL_FE_LOGIN').asString(),
    LOGOUT: env.get('REACT_APP_URL_FE_LOGOUT').required().asString(),
    LANDING: env.get('REACT_APP_URL_FE_LANDING').asString(),
    ASSISTANCE_MERCHANT: env.get('REACT_APP_URL_FE_ASSISTANCE_MERCHANTS').asString(),
  },

  URL_API: {
    MERCHANTS: env.get('REACT_APP_URL_API_MERCHANTS').asString(),
    MERCHANTS_PORTAL: env.get('REACT_APP_URL_API_MERCHANTS_PORTAL').asString(),
    ROLE_PERMISSION: env.get('REACT_APP_URL_API_ROLE_PERMISSION').asString(),
    EMAIL_NOTIFICATION: env.get('REACT_APP_URL_API_EMAIL_NOTIFICATION').asString(),
  },

  API_TIMEOUT_MS: {
    MERCHANTS_PORTAL: env.get('REACT_APP_API_MERCHANTS_PORTAL_TIMEOUT_MS').required().asInt(),
    MERCHANTS: env.get('REACT_APP_API_MERCHANTS_TIMEOUT_MS').required().asInt(),
    ROLE_PERMISSION: env.get('REACT_APP_API_ROLE_PERMISSION_TIMEOUT_MS').required().asInt(),
    EMAIL_NOTIFICATION: env.get('REACT_APP_API_EMAIL_NOTIFICATION_TIMEOUT_MS').required().asInt(),
  },

  URL_INSTITUTION_LOGO: {
    PREFIX: env.get('REACT_APP_URL_INSTITUTION_LOGO_PREFIX').asString(),
    SUFFIX: env.get('REACT_APP_URL_INSTITUTION_LOGO_SUFFIX').asString(),
  },

  ANALYTCS: {
    ENABLE: env.get('REACT_APP_ANALYTICS_ENABLE').default('false').asBool(),
    MOCK: env.get('REACT_APP_ANALYTICS_MOCK').default('false').asBool(),
    DEBUG: env.get('REACT_APP_ANALYTICS_DEBUG').default('false').asBool(),
    TOKEN: env.get('REACT_APP_MIXPANEL_TOKEN').asString(),
    API_HOST: env
      .get('REACT_APP_MIXPANEL_API_HOST')
      .default('https://api-eu.mixpanel.com')
      .asString(),
  },
  ONE_TRUST: {
    OT_NOTICE_CDN_URL: env.get('REACT_APP_ONE_TRUST_OTNOTICE_CDN_URL').required().asString(),
    OT_NOTICE_CDN_SETTINGS: env
      .get('REACT_APP_ONE_TRUST_OTNOTICE_CDN_SETTINGS')
      .required()
      .asString(),
    PRIVACY_POLICY_ID: env
      .get('REACT_APP_ONE_TRUST_PRIVACY_POLICY_ID_MERCHANTS')
      .required()
      .asString(),
    PRIVACY_POLICY_JSON_URL: env
      .get('REACT_APP_ONE_TRUST_PRIVACY_POLICY_JSON_URL_MERCHANTS')
      .required()
      .asString(),
    TOS_ID: env.get('REACT_APP_ONE_TRUST_TOS_ID_MERCHANTS').required().asString(),
    TOS_JSON_URL: env.get('REACT_APP_ONE_TRUST_TOS_JSON_URL_MERCHANTS').required().asString(),
  },
};
