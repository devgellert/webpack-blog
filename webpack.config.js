require('dotenv').config()

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const translations = require("./translations");

const configPath = path.resolve(__dirname, "pages-config.json");

const configFileContent = fs.readFileSync(configPath);

const parsedConfigFileContent = JSON.parse(configFileContent.toString())

const scripts = fs.readdirSync(path.resolve(__dirname, "src/scripts"));

const scriptEntries = {};

scripts.forEach(script => {
    const withoutExt = path.parse(script).name;
    scriptEntries[withoutExt] = path.resolve(__dirname, `src/scripts/${script}`)
});

const locales = (process.env.LOCALES || "").split(',');

const pagePlugins = [];

Object.keys(parsedConfigFileContent).forEach((locale) => {
    const localeContent = parsedConfigFileContent[locale];

    const staticTranslations = translations?.[locale] ?? {};

    const archiveCategories = [];

    Object.keys(localeContent).forEach((categorySlug) => {
        const categoryContent = localeContent[categorySlug];

        const categoryPagePostsData = [];

        Object.keys(categoryContent.posts).forEach((postSlug) => {
            const post = categoryContent.posts[postSlug]

            pagePlugins.push(
                new HtmlWebpackPlugin({
                    title: post.metaTitle,
                    filename: `${locale}/${categorySlug}/${postSlug}.html`,
                    template: "src/templates/single-post.hbs",
                    chunks: ["index", "single-post"],
                    templateParameters: {
                        post,
                        i18n: staticTranslations?.["single-post"] ?? {}
                    },
                })
            )

            categoryPagePostsData.push({
                title: post.title,
                url: `${process.env.PUBLIC_URL}/${locale}/${categorySlug}/${postSlug}.html`
            });
        });

        // add category page
        pagePlugins.push(
            new HtmlWebpackPlugin({
                title: categoryContent.categoryName,
                filename: `${locale}/${categorySlug}/index.html`,
                template: "src/templates/category.hbs",
                chunks: ["index", "category"],
                templateParameters: {
                    name: categoryContent.categoryName,
                    slug: categoryContent.categorySlug,
                    locale: categoryContent.categoryLocale,
                    posts: categoryPagePostsData,
                    i18n: staticTranslations?.["category"] ?? {}
                }
            })
        );

        archiveCategories.push({
            name: categoryContent.categoryName,
            url: `${process.env.PUBLIC_URL}/${locale}/${categorySlug}`
        });
    });

    // add archive page
    pagePlugins.push(
        new HtmlWebpackPlugin({
            title: "Archive",
            filename: `${locale}/archive.html`,
            template: "src/templates/archive.hbs",
            chunks: ["index", "archive"],
            templateParameters: {
                categories: archiveCategories,
                i18n: staticTranslations?.["archive"] ?? {},
                otherLocales: locales.map(locale => ({locale, url: `${process.env.PUBLIC_URL}/${locale}/archive.html`}))
            } // TODO
        })
    );
});

module.exports = {
    mode: "development",
    entry: {
        ...scriptEntries,
        home: path.resolve(__dirname, "src/scripts/home.js")
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
                            // outputPath: "media",
                            // publicPath: "/media",
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
        new CopyWebpackPlugin({ patterns: [{ from: "./public" }] }),
        new HtmlWebpackPlugin({
            title: "Home",
            filename: `index.html`,
            template: "src/templates/home.hbs",
            chunks: ["index", "home"],
            templateParameters: {
                i18n: translations?.["en"]?.["home"] ?? {}
            }
        }),
        ...pagePlugins
    ]
}