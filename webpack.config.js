var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

const common = {
    module: {
        loaders: [{
            test: /\.js$/,
            include: [
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, 'test')
            ],
            exclude: /node_modules/,
            loader: 'babel-loader'
        },{test: /\.(woff2?|svg)$/, loader: 'url-loader?limit=10000'},
            {test: /\.(ttf|eot)$/, loader: 'file-loader'}
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ],

    resolve: {
        modules: [
            "node_modules",
            path.resolve('./src')
        ]
    },

    devtool: "cheap-module-eval-source-map",
    devServer: {
        contentBase: "./dist",
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
};

const web = {
    entry: {
        web: ['bootstrap-loader','./src/main.js']
    },

    plugins: [
        new CopyWebpackPlugin([{
             from: path.resolve('./web')
        }]),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ],

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    }
};

const vassalbot = {
    entry: {
        vassalbot: ['./src/vassalbot.js']
    },

    target: 'node',

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2'
    }
};

module.exports = [
    Object.assign({}, common, web),
    Object.assign({}, common, vassalbot)
];