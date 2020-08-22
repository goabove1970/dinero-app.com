var path = require('path');
var paths = require('./config/paths');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');
var merge = require('webpack-merge');
var TerserPlugin = require('terser-webpack-plugin');
var commonWebpackConfig = require('./webpack.common.js');

module.exports = merge.strategy({ entry: 'replace' })(commonWebpackConfig, {
    mode: 'production',
    entry: {
        main: [require.resolve('./config/polyfills'), paths.appIndexJs]
    },
    output: {
        filename: '[name].bundle.[hash].min.js',
        path: path.join(__dirname, 'bundle'),
        chunkFilename: '[name].bundle.[hash].js',
    },
    devtool: false,
    module: {
        rules: [
            { test: /src.+\.tsx?$/, loader: 'ts-loader' }
        ]
    },
    plugins: [
        new TerserPlugin({
            parallel: true,
            terserOptions: {
                ecms: 6,
            },
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
        new CopyWebpackPlugin([
            {
                from: 'node_modules/react/umd/react.production.min.js',
                to: 'react.js'
            },
            {
                from: 'node_modules/react-dom/umd/react-dom.production.min.js',
                to: 'react-dom.js'
            },
        ])
    ]
});
