const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true,
        port: 3003,
        inline: true,
        hot: true,
        host: '0.0.0.0', //指定'0.0.0.0'让外部可访问，不然只能localhost可访问
        disableHostCheck: false //不检查域名
    },
    optimization: {
        minimize: false
    }
});
