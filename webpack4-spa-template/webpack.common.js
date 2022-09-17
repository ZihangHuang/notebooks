const path = require('path');
// const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'js/[name].[hash].js', // [hash]、[chunkhash]、[chunkhash]
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: devMode
                            ? 'style-loader' // 将处理结束的css代码存储在js中，运行时嵌入<style>后挂载到html页面上
                            : MiniCssExtractPlugin.loader, // 将处理后的CSS代码提取为独立的CSS文件，可以只在生产环境中配置
                        options: devMode
                            ? {}
                            : {
                                publicPath: '../' // 提取出来的css文件里样式引用的资源，将其路径替换为该publicPath + 原路径，否则路径对不上
                            }
                    },
                    {
                        loader: 'css-loader' // 加载器，使webpack可以识别css文件
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [require('autoprefixer')()] // autoprefixer功能，为css添加前缀
                        }
                    },
                    {
                        loader: 'less-loader' // compiles Less to CSS
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|jpeg)$/,
                loader: 'url-loader',
                options: {
                    limit: 8192,
                    fallback: 'file-loader', // 大于8192字节的则使用file-loader处理，name和outputPath值会传给它
                    name: '[hash].[ext]',
                    outputPath:'images'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            minify: {
                removeRedundantAttributes: true, // 删除多余的属性
                collapseWhitespace: true, // 折叠空白区域
                removeAttributeQuotes: true, // 移除属性的引号
                removeComments: true, // 移除注释
                collapseBooleanAttributes: true // 省略只有 boolean 值的属性值 例如：readonly checked
            }
        })
    ]
};
