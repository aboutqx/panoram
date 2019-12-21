// webpack.config.js
const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ip = require('ip');
const serverIp = ip.address();
const HtmlWebpackPlugin = require("html-webpack-plugin")

const pathNodeModules = path.resolve(__dirname, 'node_modules')
const env = process.env.NODE_ENV
const isProd = env === 'production'

console.log('Environment isProd :', isProd)

function getOutput() {

    if (isProd) {
        return path.resolve(__dirname, "dist/")
    } else {
        return path.resolve(__dirname, "src/")
    }

}

let plugins = [
    new webpack.HotModuleReplacementPlugin(), new HtmlWebpackPlugin({
        cache: true,
        hash: true,
        inject: true,
        chunks: ['app'],
        minify: {
            removeComments: false,
            collapseWhitespace: false,
            removeAttributeQuotes: true
        },
        publicPath: '/', // css js path
        filename: 'index.html',
        template: 'src/index.html'
    })
]

if (isProd) {
    plugins = plugins.concat([
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            compress: {
                drop_debugger: true,
                drop_console: true,
                screw_ie8: true
            },
            comments: false,
            mangle: false
        }),
        new ExtractTextPlugin('[name].css'),
        new CopyWebpackPlugin([{
                from: 'src/vendors',
                to: 'vendors'
            }
        ])
    ])
}

const entry = {
    app: './src/app.js'
}

const output = {
    filename: 'bundle.js',
    path: getOutput(),
    publicPath: !isProd ? `http://${serverIp}:8081/` : '' // global ajax get file path
}
console.log(getOutput())
const devtool = isProd ? 'source-map' : 'inline-source-map';

const config = {
    entry,
    devtool,
    devServer: {
        host: 'localhost',
        contentBase: './src',
        hot: true,
        disableHostCheck: true,
        port: 8081
    },
    plugins,
    output,
    module: {
        rules: [{
                test: /\.js$/,
                loader: 'babel-loader',

                exclude: pathNodeModules
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                exclude: pathNodeModules
            },
            {
                test: /\.scss$/,
                use: isProd ?
                    ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: ["css-loader", "postcss-loader",
                            "sass-loader"
                        ]
                    }): ["style-loader", "css-loader", "postcss-loader",
                        "sass-loader"
                    ],
                exclude: pathNodeModules
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: '[name].[ext]'
                }
            },
            {
                test: /\.(glsl|vert|frag)$/,
                use: ["raw-loader", "glslify-loader"],
                exclude: pathNodeModules
            }
        ]
    },
    resolve: {
        alias: {
            'libs': path.resolve(__dirname, './src/libs'),
        }
    }
}

module.exports = config;
