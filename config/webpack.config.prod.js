const HTMLWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const webpack = require('webpack');
const getClientEnvironment = require('./env');
const path = require('path');

const publicUrl = process.env.PUBLIC_URL;
const env = getClientEnvironment('production', publicUrl);

// console.info("env.stringified['process.env']:" + JSON.stringify(env.stringified['process.env']));
// console.info("env.stringified['raw.env']:" + JSON.stringify(env.raw));
const shouldUseSourceMap = env.raw.GENERATE_SOURCEMAP !== 'false';
const shouldBundleAnalyze = env.raw.BUNDLE_ANALYZER !== 'false';

module.exports = {
  mode: 'production',
  devtool: shouldUseSourceMap ? 'source-map' : undefined,
  entry: [require.resolve('./polyfills'), path.resolve('src/index.js')],
  resolve: {
    modules: [path.resolve('src'), path.resolve('node_modules')],
    extensions: ['.js', '.jsx'],
    alias: {
      modernizr$: path.resolve('.modernizrrc'),
    },
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].[hash].js',
    publicPath: publicUrl,
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          emitWarning: true,
          emitError: false,
          failOnError: false,
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.svg$/,
        use: [
          'babel-loader',
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true, // true outputs JSX tags,
              svgo: {
                floatPrecision: 3,
              },
            },
          },
        ],
      },
      {
        test: /\.modernizrrc.js$/,
        use: ['modernizr-loader'],
      },
      {
        test: /\.modernizrrc(\.json)?$/,
        use: ['modernizr-loader', 'json-loader'],
      },
      {
        exclude: [/\.(js|jsx|mjs|html|json)$/],
        loader: require.resolve('file-loader'),
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([path.resolve('build')], {
      root: path.resolve('.'),
    }),
    new LodashModuleReplacementPlugin({
      paths: true,
      // "shorthands":true,
      // "cloning":true,
      // "currying":true,
      // "caching":true,
      // "collections":true,
      // "exotics":true,
      // "guards":true,
      // "metadata":true,
      // "deburring":true,
      // "unicode":true,
      // "chaining":true,
      // "memoizing":true,
      // "coercions":true,
      // "flattening":true,
      // "placeholders":true
    }),
    new SWPrecacheWebpackPlugin({
      cacheId: 'react-pro',
      filename: 'service-worker.js',
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          // This message occurs for every build and is a bit too noisy.
          return;
        }
        console.log(message);
      },
      mergeStaticsConfig: true, // if you don't set this to true, you won't see any webpack-emitted assets in your serviceworker config
      minify: true,
      navigateFallback: publicUrl + 'index.html',
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    }),
    // new FaviconsWebpackPlugin({
    //   logo: path.resolve('src/assets/icon.png'),
    //   prefix: '',
    //   background: '#ffffff',
    //   title: 'React Pro1',
    //   emitStats: false,
    //   statsFilename: 'iconstats.json',
    //   // persistentCache: false,
    // }),
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
    new WebpackPwaManifest({
      filename: 'manifest.json',
      name: 'React Pro2',
      short_name: 'ReactPro2',
      lang: 'en-US',
      description: 'My awesome Progressive Web App!',
      background_color: '#ffffff',
      ios: true,
      inject: true,
      icons: [
        {
          src: path.resolve('src/assets/icon.png'),
          sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
        },
      ],
    }),
    new webpack.DefinePlugin(env.stringified),
    new HTMLWebpackPlugin({
      template: path.resolve('public/index.html'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    shouldBundleAnalyze
      ? new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
        })
      : () => ({}),
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },

  performance: {
    hints: 'error',
  },
};