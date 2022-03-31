const each = require("./helpers/each");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const createFilenames = require("./createFilenames");
const templatePaths = require("./templatePaths");
const chunksByPage = require("./chunksByPage");
const createCommonConfig = require("./createCommonConfig");
const createPaths = require("./createPaths");
const getPageAndGlobalTranslations = require("./helpers/getPageAndGlobalTranslations");
const parseJsonFile = require("./helpers/parseJsonFile");
const paths = require("./paths");

const pagePlugins = [];

const config = parseJsonFile(paths.pagesConfig);

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

    // add not found page
    pagePlugins.push(
        new HtmlWebpackPlugin({
            filename: createFilenames.notFound(locale),
            template: templatePaths.notFound,
            chunks: chunksByPage.notFound,
            templateParameters: {
                ...createCommonConfig(locale, createPaths.notFound),
                i18n: getPageAndGlobalTranslations(locale, "not-found")
            }
        })
    );
});

module.exports = pagePlugins;
