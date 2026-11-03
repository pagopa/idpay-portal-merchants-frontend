import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
const localMockApiURL = `${baseURL}/e2e-api`;
const slowMoValue = process.env.PLAYWRIGHT_SLOWMO_MS ?? process.env.PLAYWRIGHT_SLOWMO;
const slowMo = slowMoValue ? Number(slowMoValue) : 0;

if (!Number.isFinite(slowMo) || slowMo < 0) {
  throw new Error('PLAYWRIGHT_SLOWMO_MS must be a non-negative number');
}

export default defineConfig({
  testDir: 'tests/e2e/specs',
  timeout: slowMo > 0 ? 0 : 30_000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    headless: true,
    launchOptions: { slowMo },
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'yarn start',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          BROWSER: 'none',
          PUBLIC_URL: '/portale-esercenti',
          REACT_APP_ENV: 'DEV',
          REACT_APP_PAGOPA_HEADER_OPERATION_MANUAL_LINK: `${baseURL}/manual`,
          REACT_APP_PAGOPA_FOOTER_PRIVACYPOLICY: `${baseURL}/privacy`,
          REACT_APP_PAGOPA_FOOTER_PROTECTIONOFPERSONALDATA: `${baseURL}/privacy-data`,
          REACT_APP_PAGOPA_FOOTER_TERMSANDCONDITIONS: `${baseURL}/terms`,
          REACT_APP_PAGOPA_FOOTER_ACCESSIBILITY: `${baseURL}/accessibility`,
          REACT_APP_PAGOPA_HELP_EMAIL: 'e2e@example.com',
          REACT_APP_PAGOPA_HELP_LINK: `${baseURL}/assistenza`,
          REACT_APP_URL_FE_PRE_LOGIN: `${baseURL}/portale-esercenti/auth`,
          REACT_APP_URL_FE_LOGIN: `${baseURL}/portale-esercenti/auth`,
          REACT_APP_URL_FE_LOGOUT: `${baseURL}/portale-esercenti/auth`,
          REACT_APP_URL_FE_LANDING: `${baseURL}/portale-esercenti`,
          REACT_APP_URL_FE_ASSISTANCE_MERCHANTS: `${baseURL}/portale-esercenti/assistenza`,
          REACT_APP_URL_API_MERCHANTS: `${localMockApiURL}/merchants`,
          REACT_APP_URL_API_MERCHANTS_PORTAL: `${localMockApiURL}/merchants-portal`,
          REACT_APP_URL_API_ROLE_PERMISSION: `${localMockApiURL}/role-permission`,
          REACT_APP_URL_API_EMAIL_NOTIFICATION: `${localMockApiURL}/email-notification`,
          REACT_APP_API_MERCHANTS_PORTAL_TIMEOUT_MS: '5000',
          REACT_APP_API_MERCHANTS_TIMEOUT_MS: '5000',
          REACT_APP_API_ROLE_PERMISSION_TIMEOUT_MS: '5000',
          REACT_APP_API_EMAIL_NOTIFICATION_TIMEOUT_MS: '5000',
          REACT_APP_URL_INSTITUTION_LOGO_PREFIX: `${baseURL}/institution-logo/`,
          REACT_APP_URL_INSTITUTION_LOGO_SUFFIX: '.png',
          REACT_APP_ANALYTICS_ENABLE: 'false',
          REACT_APP_ANALYTICS_MOCK: 'true',
          REACT_APP_MIXPANEL_DEBUG: 'false',
          REACT_APP_ANALYTICS_DEBUG: 'false',
          REACT_APP_MIXPANEL_TOKEN: 'playwright-local',
          REACT_APP_ONE_TRUST_BASE_URL: `${localMockApiURL}/one-trust`,
          REACT_APP_ONE_TRUST_DOMAIN_ID: 'playwright-local',
          REACT_APP_ONE_TRUST_OTNOTICE_CDN_URL: `${baseURL}/e2e-api/one-trust/notice.js`,
          REACT_APP_ONE_TRUST_OTNOTICE_CDN_SETTINGS: 'playwright-local',
          REACT_APP_ONE_TRUST_PRIVACY_POLICY_ID_MERCHANTS: 'playwright-local',
          REACT_APP_ONE_TRUST_PRIVACY_POLICY_JSON_URL_MERCHANTS: `${baseURL}/e2e-api/one-trust/privacy.json`,
          REACT_APP_ONE_TRUST_TOS_ID_MERCHANTS: 'playwright-local',
          REACT_APP_ONE_TRUST_TOS_JSON_URL_MERCHANTS: `${baseURL}/e2e-api/one-trust/tos.json`,
        },
      },
});
