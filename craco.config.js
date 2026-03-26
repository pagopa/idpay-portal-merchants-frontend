module.exports = {
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.m?js$/,
            resolve: {
              fullySpecified: false,
            },
          },
        ],
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
  },
  jest: {
    configure: {
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(@pagopa|@standard-schema|@mui)/)',
      ],
      coveragePathIgnorePatterns: [
        '/node_modules/',
        'babel.config.js',
        '__mocks__/@standard-schema/utils.js',
        'src/index.js',
        'src/reportWebVitals.ts',
        'src/api/generated',
      ],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@standard-schema/utils$': '<rootDir>/__mocks__/@standard-schema/utils.js',
        '^@reduxjs/toolkit/query/react$':
          '@reduxjs/toolkit/dist/query/react/cjs/index.js',
        '^@reduxjs/toolkit/query$':
          '@reduxjs/toolkit/dist/query/cjs/index.js',
        '@pagopa/selfcare-common-frontend/consentManagementConfigure':
          '@pagopa/selfcare-common-frontend/lib/consentManagementConfigure',
        '@pagopa/selfcare-common-frontend/config/env':
          '@pagopa/selfcare-common-frontend/lib/config/env',
      },
    },
  },
};
