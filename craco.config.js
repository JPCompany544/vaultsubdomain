const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 1. Allow imports like 'process/browser' (skip "fullySpecified")
      webpackConfig.module.rules.unshift({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      });

      // 2. Add polyfills for Node.js core modules
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          process: require.resolve('process/browser'),
          stream: require.resolve('stream-browserify'),
          zlib: require.resolve('browserify-zlib'),
          crypto: require.resolve('crypto-browserify'),
          buffer: require.resolve('buffer'),
          url: require.resolve('url/'),
          assert: require.resolve('assert'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          os: require.resolve('os-browserify/browser'),
          path: require.resolve('path-browserify'),
          fs: false, // ignore unsupported modules in browser
          net: false,
          tls: false,
        }
      };

      // 3. Inject process + Buffer globals
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer']
        })
      );

      return webpackConfig;
    }
  }
};
