const path = require('path');
// const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    output: {
        filename: 'js/[name].[hash].js',
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
                            ? 'style-loader'
                            : MiniCssExtractPlugin.loader,
                        options: devMode
                            ? {}
                            : {
                                publicPath: '../'
                            }
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [require('autoprefixer')()]
                        }
                    },
                    {
                        loader: 'less-loader'
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|jpeg)$/,
                loader: 'url-loader',
                options: {
                    limit: 8192,
                    fallback: 'file-loader',
                    name: '[hash].[ext]',
                    outputPath:'images'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index/index.html',
            filename: 'index.html',
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            template: './src/home/index.html',
            filename: 'home.html',
            chunks: ['home']
        })
    ]
};
