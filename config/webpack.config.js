const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
//
const scriptEntries = require("./scriptEntries");
const pagePlugins = require("./pagePlugins");
const paths = require("./paths");

module.exports = {
    mode: "development",
    entry: {
        ...scriptEntries,
        home: paths.homeJs
    },
    output: {
        path: paths.dist,
        filename: "[name].[contenthash].js",
        clean: true,
        assetModuleFilename: "[name][ext]"
    },
    devtool: "source-map", // .js.map file-t hoz létre a debuggoláshoz
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    // "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.js$/,
                exclude: /node-modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                use: [
                    {
                        loader: require.resolve("url-loader"),
                        options: {
                            esModule: false,
                            limit: 1024,
                            // outputPath: "media",
                            // publicPath: "/media",
                            name: "[name].[hash:8].[ext]"
                        }
                    }
                ]
            },
            {
                test: /\.hbs$/,
                loader: "handlebars-loader"
            }
        ]
    },
    devServer: {
        static: {
            directory: paths.dist
        },
        port: 3000,
        // open: true,
        hot: true,
        compress: true,
        historyApiFallback: true
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].[hash].css",
            chunkFilename: "[id].css"
        }),
        new CopyWebpackPlugin({ patterns: [{ from: "./public" }] }),
        ...pagePlugins
    ]
};
