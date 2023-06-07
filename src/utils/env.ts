import * as env from 'env-var';

const PUBLIC_URL_INNER: string | undefined =
  env.get('PUBLIC_URL').asString() || '/portale-esercenti';
export const ENV = {
  ENV: env.get('REACT_APP_ENV').required().asString(),
  PUBLIC_URL: PUBLIC_URL_INNER,

  ASSISTANCE: {
    EMAIL: env.get('REACT_APP_PAGOPA_HELP_EMAIL').required().asString(),
  },

  URL_FE: {
    PRE_LOGIN: env.get('REACT_APP_URL_FE_PRE_LOGIN').required().asString(),
    LOGIN: env.get('REACT_APP_URL_FE_LOGIN').required().asString(),
    LOGOUT: env.get('REACT_APP_URL_FE_LOGOUT').required().asString(),
    LANDING: env.get('REACT_APP_URL_FE_LANDING').required().asString(),
    ASSISTANCE: env.get('REACT_APP_URL_FE_ASSISTANCE').required().asString(),
  },

  URL_API: {
    MERCHANTS: env.get('REACT_APP_URL_API_MERCHANTS').required().asString(),
    MERCHANTS_PORTAL: env.get('REACT_APP_URL_API_MERCHANTS_PORTAL').required().asString(),
    ROLE_PERMISSION: env.get('REACT_APP_URL_API_ROLE_PERMISSION').required().asString(),
    EMAIL_NOTIFICATION: env.get('REACT_APP_URL_API_EMAIL_NOTIFICATION').required().asString(),
  },

  API_TIMEOUT_MS: {
    MERCHANTS: env.get('REACT_APP_URL_API_MERCHANTS_TIMEOUT_MS').required().asString(),
    MERCHANTS_PORTAL: env.get('REACT_APP_API_MERCHANTS_PORTAL_TIMEOUT_MS').required().asInt(),
    ROLE_PERMISSION: env.get('REACT_APP_API_ROLE_PERMISSION_TIMEOUT_MS').required().asInt(),
    EMAIL_NOTIFICATION: env.get('REACT_APP_API_EMAIL_NOTIFICATION_TIMEOUT_MS').required().asInt(),
  },

  URL_INSTITUTION_LOGO: {
    PREFIX: env.get('REACT_APP_URL_INSTITUTION_LOGO_PREFIX').required().asString(),
    SUFFIX: env.get('REACT_APP_URL_INSTITUTION_LOGO_SUFFIX').required().asString(),
  },

  ANALYTCS: {
    ENABLE: env.get('REACT_APP_ANALYTICS_ENABLE').default('false').asBool(),
    MOCK: env.get('REACT_APP_ANALYTICS_MOCK').default('false').asBool(),
    DEBUG: env.get('REACT_APP_ANALYTICS_DEBUG').default('false').asBool(),
    TOKEN: env.get('REACT_APP_MIXPANEL_TOKEN').required().asString(),
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
    PRIVACY_POLICY_ID: env.get('REACT_APP_ONE_TRUST_PRIVACY_POLICY_ID').required().asString(),
    PRIVACY_POLICY_JSON_URL: env
      .get('REACT_APP_ONE_TRUST_PRIVACY_POLICY_JSON_URL')
      .required()
      .asString(),
    TOS_ID: env.get('REACT_APP_ONE_TRUST_TOS_ID').required().asString(),
    TOS_JSON_URL: env.get('REACT_APP_ONE_TRUST_TOS_JSON_URL').required().asString(),
  },
};
