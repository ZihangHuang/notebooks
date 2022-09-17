const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    devtool: false,
    optimization: {
        // mode: 'production'会开启tree-shaking和js代码压缩，
        // 但配置optimization. minimizer会使默认的压缩功能失效。
        // 所以，指定css压缩插件的同时，务必指定js的压缩插件。
        minimizer: [
            new OptimizeCssAssetsWebpackPlugin(), // 压缩css
            new UglifyJsPlugin({ // 压缩js
                cache: false,
                parallel: true
            })
        ],
        // splitChunks的作用是抽离公用代码
        // chunks:
        // async:对那些按需引入的模块进行拆解
        // initial:将入口点中直接引入的模块、模块中引入的模块进行拆解并单独打包
        // all:上述两种都包含
        // 这里用mini-css-extract-plugin插件，结合optimization.splitChunks.cacheGroups配置，
        // 可以把css代码打包到单独的css文件，且可以设置存放路径（通过设置插件的filename和chunkFilename）。
        splitChunks: { // 把提取的所有CSS文件合并为一个文件
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
            filename: 'css/[name].[hash].css' // 将处理后的CSS代码提取为独立的CSS文件，可以只在生产环境中配置
        })
    ]
});
