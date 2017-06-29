var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: ['bootstrap-loader', './src/main.js'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: "cheap-module-eval-source-map",
    devServer: {
        contentBase: "./dist",
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    },
    
    resolve: {
        modules: [
            "node_modules",
            path.resolve('./src')
        ]
    },

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
    ]

};