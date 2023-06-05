/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'uat' | 'production';

    REACT_APP_API_MOCK_PARTIES: string;
    REACT_APP_API_MOCK_PRODUCTS: string;
    REACT_APP_API_MOCK_ROLE_PERMISSION: string;
    REACT_APP_API_MOCK_EMAIL_NOTIFICATION: string;
    REACT_APP_API_MOCK_MERCHANTS: string;
  }
}
interface Window {
  Stripe: any;
}
