module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // CRA (react-scripts) transpiles our `src/` with Babel but, by default, it does NOT transpile
      // most of `node_modules/`. Some MUI packages ship ESM with named exports like
      // `internal_serializeStyles` which must be converted to CJS for the webpack runtime used by CRA.
      //
      // If they are left as-is, webpack may fail with:
      // "Attempted import error: 'internal_serializeStyles' is not exported from '@mui/styled-engine'"
      // even though the package actually exports it.
      const babelLoaderRule = webpackConfig.module.rules
        .find((rule) => Array.isArray(rule.oneOf))
        ?.oneOf?.find(
          (rule) =>
            rule.loader &&
            typeof rule.loader === 'string' &&
            rule.loader.includes('babel-loader') &&
            rule.options &&
            rule.options.presets
        );
 
      if (babelLoaderRule) {
        babelLoaderRule.include = [
          ...(Array.isArray(babelLoaderRule.include) ? babelLoaderRule.include : [babelLoaderRule.include]).filter(
            Boolean
          ),
          /node_modules[\\\\/]@mui[\\\\/]/,
        ];
      }

      // Force CRA/webpack to prefer the CJS entrypoints for MUI packages.
      // This avoids ESM-vs-CJS interop issues where CRA ends up importing an ESM build and
      // then complains about missing "default export" (e.g. `@mui/system/createStyled`).
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.mainFields = ['main'];

      // Webpack 5 doesn't polyfill Node core modules. Some transitive deps (e.g. node-fetch v2)
      // can still try to import them even in browser builds.
      //
      // IMPORTANT: keep these modules disabled. If a dependency tries to import them in a browser
      // build, we want the build/runtime to fail early instead of silently polyfilling Node behavior.
      webpackConfig.resolve.fallback = {
        ...(webpackConfig.resolve.fallback || {}),
        http: false,
        https: false,
        stream: false,
        zlib: false,
        url: false,
        util: false,
        buffer: false,
        path: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        assert: false,
        constants: false,
        tty: false,
      };

      // agentkeepalive is Node-only (extends http.Agent). If it ends up in the browser bundle it crashes
      // with "Class extends value undefined". Force it to a browser-safe stub.
      //
      // node-fetch (v2) is also Node-only and depends on core modules (http/https/stream/buffer/...).
      // Some transitive deps in `@pagopa/selfcare-common-frontend` can import it even in browser builds.
      // Force it to a stub that delegates to the browser native `fetch`.
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {}),
        agentkeepalive: require.resolve('./src/shims/agentkeepalive-browser.js'),
        'node-fetch': require.resolve('./src/shims/node-fetch-browser.js'),
      };

      // Some transitive deps expect the Node global `process` to exist.
      // CRA (webpack5) doesn't provide it automatically anymore.
      // Provide it via webpack's ProvidePlugin.
      const webpack = require('webpack');
      webpackConfig.plugins = webpackConfig.plugins || [];
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
        })
      );
 
      return {
        ...webpackConfig,
        module: {
          ...webpackConfig.module,
          rules: [
            ...(webpackConfig.module?.rules ?? []),
            {
              test: /\.m?js/,
              resolve: {
                fullySpecified: false,
              },
            },
          ],
        },
        ignoreWarnings: [/Failed to parse source map/],
      };
    },
  },
};
