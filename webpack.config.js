const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const configPath = path.resolve(__dirname, "pages-config.json");

const configFileContent = fs.readFileSync(configPath);

const parsedConfigFileContent = JSON.parse(configFileContent.toString())

const scripts = fs.readdirSync(path.resolve(__dirname, "src/scripts"));

const scriptEntries = {};

scripts.forEach(script => {
    const withoutExt = path.parse(script).name;
    scriptEntries[withoutExt] = path.resolve(__dirname, `src/scripts/${script}`)
});

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
                    template: "src/templates/single-post.hbs",
                    chunks: ["index", "single-post"]
                })
            )
        });
    });
});

module.exports = {
    mode: "development",
    entry: {
        ...scriptEntries
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
                            outputPath: "media",
                            publicPath: "/media",
                            name: "[name].[hash:8].[ext]",
                        }
                    }
                ],
            },
            {
                test: /\.hbs$/,
                loader: "handlebars-loader"
            }
        ]
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, "dist")
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
        ...postPlugins
    ]
}