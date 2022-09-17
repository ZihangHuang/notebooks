const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
    entry: {
        home: ['./src/home/index.js'],
        index: ['./src/index/index.js']
    },
    mode: 'production',
    devtool: false,
    optimization: {
        minimizer: [
            new OptimizeCssAssetsWebpackPlugin(),
            new UglifyJsPlugin({
                cache: false,
                parallel: true
            })
        ],
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new copyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'public'),
                to: path.resolve(__dirname, 'dist')
            }
        ]),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css'
        })
    ]
});
