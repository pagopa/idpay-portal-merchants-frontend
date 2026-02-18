const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@pagopa/selfcare-common-frontend$': path.resolve(
        __dirname,
        'node_modules/@pagopa/selfcare-common-frontend/lib/index.js'
      ),
    },
    configure: {
      module: {
        rules: [
          {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false,
            },
          },
        ],
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
  },
};
