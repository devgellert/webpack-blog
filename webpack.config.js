const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
//
const translations = require("./translations");

dotenv.config();

const paths = {
    config: path.resolve(__dirname, "pages-config.json"),
    scripts: path.resolve(__dirname, "src/scripts")
};

const configFile = fs.readFileSync(paths.config);
const config = JSON.parse(configFile.toString());

const scripts = fs.readdirSync(paths.scripts);
const scriptEntries = {};
scripts.forEach(script => {
    const withoutExt = path.parse(script).name;
    scriptEntries[withoutExt] = path.resolve(__dirname, `src/scripts/${script}`);
});

const locales = (process.env.LOCALES || "").split(",");
const defaultLocale = process.env.DEFAULT_LOCALE || null;
const htmlExtensionInUrl = process.env.HTML_EXTENSION_IN_URL === "true";

const getPageAndGlobalTranslations = (locale, page) => {
    const staticTranslations = translations?.[locale] ?? {};

    const i18n = staticTranslations?.[page] ?? {};

    return {
        ...i18n,
        global: staticTranslations?.global ?? {}
    };
};

const pagePlugins = [];

const each = (object, cb) => Object.keys(object).forEach(key => cb(key, object[key]));

const htmlExtension = htmlExtensionInUrl ? ".html" : "";

const createFilenames = {
    post: (locale, category, post) => {
        if (defaultLocale === locale) {
            return `${category}/${post}.html`;
        }

        return `${locale}/${category}/${post}.html`;
    },
    category: (locale, category) => {
        if (defaultLocale === locale) {
            return `${category}/index.html`;
        }

        return `${locale}/${category}/index.html`;
    },
    archive: locale => {
        if (defaultLocale === locale) {
            return `archive.html`;
        }

        return `${locale}/archive.html`;
    },
    home: locale => {
        if (defaultLocale === locale) {
            return "index.html";
        }

        return `${locale}/index.html`;
    }
};

const createPaths = {
    post: (locale, category, post) => {
        if (defaultLocale === locale) {
            return `${category}/${post}${htmlExtension}`;
        }

        return `${locale}/${category}/${post}${htmlExtension}`;
    },
    category: (locale, category) => {
        if (defaultLocale === locale) {
            return `${category}/`;
        }

        return `${locale}/${category}/`;
    },
    archive: locale => {
        if (defaultLocale === locale) {
            return `archive${htmlExtension}`;
        }

        return `${locale}/archive${htmlExtension}`;
    },
    home: locale => {
        if (defaultLocale === locale) {
            return "";
        }

        return locale;
    }
};

const templatePaths = {
    post: "src/templates/single-post.hbs",
    category: "src/templates/category.hbs",
    archive: "src/templates/archive.hbs",
    home: "src/templates/home.hbs"
};

const chunksByPage = {
    post: ["index", "single-post"],
    category: ["index", "category"],
    archive: ["index", "archive"],
    home: ["index", "home"]
};

const createCommonConfig = (locale, createPath) => {
    const all = locales.map(locale => ({
        locale,
        url: `${process.env.PUBLIC_URL}/${createPath(locale)}`
    }));

    const others = all.filter(elem => elem.locale !== locale);

    const current = all.find(item => item.locale === locale);

    return {
        global: {
            nav: {
                homeUrl: `${process.env.PUBLIC_URL}/${createPaths.home(locale)}`,
                archiveUrl: `${process.env.PUBLIC_URL}/${createPaths.archive(locale)}`
            },
            locale: {
                current,
                all,
                others
            }
        }
    };
};

each(config, (locale, localeContent) => {
    const archiveCategories = [];

    each(localeContent, (categorySlug, categoryContent) => {
        const categoryPagePostsData = [];

        pagePlugins.push(
            new HtmlWebpackPlugin({
                filename: createFilenames.home(locale),
                template: templatePaths.home,
                chunks: chunksByPage.home,
                templateParameters: {
                    ...createCommonConfig(locale, createPaths.home),
                    i18n: getPageAndGlobalTranslations(locale, "home")
                }
            })
        );

        each(categoryContent.posts, postSlug => {
            const post = categoryContent.posts[postSlug];

            pagePlugins.push(
                new HtmlWebpackPlugin({
                    filename: createFilenames.post(locale, categorySlug, postSlug),
                    template: templatePaths.post,
                    chunks: chunksByPage.post,
                    templateParameters: {
                        ...createCommonConfig(locale, locale => createPaths.post(locale, categorySlug, postSlug)),
                        post,
                        i18n: getPageAndGlobalTranslations(locale, "single-post")
                    }
                })
            );

            categoryPagePostsData.push({
                title: post.title,
                url: `${process.env.PUBLIC_URL}/${createPaths.post(locale, categorySlug, postSlug)}`
            });
        });

        // add category page
        pagePlugins.push(
            new HtmlWebpackPlugin({
                filename: createFilenames.category(locale, categorySlug),
                template: templatePaths.category,
                chunks: chunksByPage.category,
                templateParameters: {
                    ...createCommonConfig(locale, locale => createPaths.category(locale, categorySlug)),
                    name: categoryContent.categoryName,
                    slug: categoryContent.categorySlug,
                    locale: categoryContent.categoryLocale,
                    posts: categoryPagePostsData,
                    i18n: getPageAndGlobalTranslations(locale, "category")
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
            filename: createFilenames.archive(locale),
            template: templatePaths.archive,
            chunks: chunksByPage.archive,
            templateParameters: {
                ...createCommonConfig(locale, createPaths.archive),
                categories: archiveCategories,
                i18n: getPageAndGlobalTranslations(locale, "archive")
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
        ...pagePlugins
    ]
};
