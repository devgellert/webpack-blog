const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const configPath = path.resolve(__dirname, "pages-config.json");

const configFileContent = fs.readFileSync(configPath);

const parsedConfigFileContent = JSON.parse(configFileContent.toString())

const postPlugins = [];

Object.keys(parsedConfigFileContent).forEach((locale) => {
    const localeContent = parsedConfigFileContent[locale];

    Object.keys(localeContent).forEach(( categorySlug) => {
        const categoryContent = localeContent[categorySlug];

        Object.keys(categoryContent).forEach(( postSlug) => {
            const post = categoryContent[postSlug]

            postPlugins.push(
                new HtmlWebpackPlugin({
                    title: post.metaTitle,
                    filename: `${locale}/${categorySlug}/${postSlug}.html`,
                    template: "src/index.html",
                    chunks: ["bundle"]
                })
            )
        });
    });
});

module.exports = {
    mode: "development",
    entry: {
        bundle: path.resolve(__dirname, "src/index.js")
    },
    output: {
        path: path.resolve(__dirname, "dist"),
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
                    "style-loader",
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
                type: "asset/resource"
            }
        ]
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, "dist")
        },
        port: 3000,
        open: true,
        hot: true,
        compress: true,
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Webpack App",
            filename: "index.html",
            template: "src/index.html",
            chunks: ["bundle"]
        }),
        ...postPlugins
        // new BundleAnalyzerPlugin()
    ]
}