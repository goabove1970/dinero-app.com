const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const copyAssets = [];

module.exports = {
    resolve: {
        plugins: [new TsconfigPathsPlugin()],
        modules: ['node_modules', 'src'],
        extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.css'],
    },
    module: {
        rules: [
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.{png}$/, loader: 'url-loader?limit=100000' },
            { test: /\.{svg}$/, loader: 'svg-inline-loader' },
            { test: /\.{woff|woff2|eot|ttf}$/, loader: 'file-loader?name=assets/[name].[ext]' }
        ],
    },

    optimization: {
        splitChunks: {
            chunks: 'all'
        },
    },

    plugins: [
        new webpack.DefinePlugin({
            ENVIRONMENT: JSON.stringify(process.env.ENV || 'PROD')
        }),
        ...copyAssets
    ],

};
