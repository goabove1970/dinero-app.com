var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
var WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
var getClientEnvironment = require('./config/env');
var paths = require('./config/paths');
var merge = require('webpack-merge');
var path = require('path');

var commonWebpackConfig = require('./webpack.common.js');

var publicPath = '/';
var publicUrl = '';
var env = getClientEnvironment(publicUrl);

module.exports = merge.strategy({ entry: 'replace' })(commonWebpackConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      { test: /src.+\.tsx?$/, loader: 'ts-loader' }
    ],
  },
  // entry: [
  //   require.resolve('react-dev-utils/webpackHotDevClient'),
  //   require.resolve('../config/polyfills'),
  //   paths.appIndexJs
  // ],
  entry: {
    main: [require.resolve('./config/polyfills'), paths.appIndexJs]
  },
  // output: {
  //   path: paths.appBuild,
  //   pathinfo: true,
  //   filename: '../public/index.js',
  //   publicPath: publicPath
  // },
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'bundle'),
    publicPath: publicPath
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    }
  },
  plugins: [
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
      PUBLIC_URL: publicUrl
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    new webpack.DefinePlugin(env),
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    new webpack.ProvidePlugin({
      "React": "react",
    }),
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
});
