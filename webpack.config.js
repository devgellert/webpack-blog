const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

dotenv.config();

const translations = require("./translations");

const configPath = path.resolve(__dirname, "pages-config.json");

const configFileContent = fs.readFileSync(configPath);

const parsedConfigFileContent = JSON.parse(configFileContent.toString());

const scripts = fs.readdirSync(path.resolve(__dirname, "src/scripts"));

const scriptEntries = {};

scripts.forEach(script => {
    const withoutExt = path.parse(script).name;
    scriptEntries[withoutExt] = path.resolve(__dirname, `src/scripts/${script}`);
});

const createOtherLocales = createUrl =>
    locales.map(locale => ({
        locale,
        url: `${process.env.PUBLIC_URL}${createUrl(locale)}`
    }));

const locales = (process.env.LOCALES || "").split(",");

const getPageTranslations = (locale, page) => {
    const staticTranslations = translations?.[locale] ?? {};

    const i18n = staticTranslations?.[page] ?? {};

    return {
        ...i18n,
        global: staticTranslations?.global ?? {}
    };
};

const createCommonConfig = (locale, createLocaleUrl) => ({
    global: {
        nav: {
            homeUrl: `${process.env.PUBLIC_URL}/`,
            archiveUrl: `${process.env.PUBLIC_URL}/${locale}/archive.html`
        },
        locale: {
            current: {
                locale,
                url: createLocaleUrl(locale)
            },
            all: createOtherLocales(createLocaleUrl),
            others: createOtherLocales(createLocaleUrl).filter(elem => elem.locale !== locale)
        }
    }
});

const pagePlugins = [];

Object.keys(parsedConfigFileContent).forEach(locale => {
    const localeContent = parsedConfigFileContent[locale];

    const archiveCategories = [];

    Object.keys(localeContent).forEach(categorySlug => {
        const categoryContent = localeContent[categorySlug];

        const categoryPagePostsData = [];

        Object.keys(categoryContent.posts).forEach(postSlug => {
            const post = categoryContent.posts[postSlug];

            pagePlugins.push(
                new HtmlWebpackPlugin({
                    title: post.metaTitle,
                    filename: `${locale}/${categorySlug}/${postSlug}.html`,
                    template: "src/templates/single-post.hbs",
                    chunks: ["index", "single-post"],
                    templateParameters: {
                        ...createCommonConfig(locale, locale => `/${locale}/${categorySlug}/${postSlug}.html`),
                        post,
                        i18n: getPageTranslations(locale, "single-post")
                    }
                })
            );

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
                    ...createCommonConfig(locale, locale => `/${locale}/${categorySlug}`),
                    name: categoryContent.categoryName,
                    slug: categoryContent.categorySlug,
                    locale: categoryContent.categoryLocale,
                    posts: categoryPagePostsData,
                    i18n: getPageTranslations(locale, "category")
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
                ...createCommonConfig(locale, locale => `/${locale}/archive.html`),
                categories: archiveCategories,
                i18n: getPageTranslations(locale, "archive")
            }
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
            ...createCommonConfig("en", () => ""),
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
};
