// const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    entry: {
        home: ['./src/home/index.js', 'webpack-hot-middleware/client?name=home&reload=true'],
        index: ['./src/index/index.js', 'webpack-hot-middleware/client?name=index&reload=true']
    },
    mode: 'development',
    devtool: 'inline-source-map',
    optimization: {
        minimize: false
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ]
});
