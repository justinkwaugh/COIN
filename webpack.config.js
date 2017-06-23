var path = require('path');

module.exports = {
    entry: './src/main.js',
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
            path.resolve('./src'),
            path.resolve('./node_modules')
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
        }]
    }

};