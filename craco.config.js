module.exports = {
  webpack: {
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
  jest: {
    configure: {
      transformIgnorePatterns: [
        "node_modules/(?!(?:@pagopa|@standard-schema|@reduxjs)/)",
      ],
      moduleNameMapper: {
        "\\\\.(css|less|scss|sass)$": "identity-obj-proxy",
      },
    },
  },
};
