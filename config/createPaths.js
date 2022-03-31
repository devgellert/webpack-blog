const dotenv = require("dotenv");
const paths = require("./paths");

dotenv.config({
    path: paths.dotenv
});

const defaultLocale = process.env.DEFAULT_LOCALE || null;

const htmlExtensionInUrl = process.env.HTML_EXTENSION_IN_URL === "true";

const htmlExtension = htmlExtensionInUrl ? ".html" : "";

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
    },
    notFound: locale => {
        if (defaultLocale === locale) {
            return `not-found${htmlExtension}`;
        }

        return `${locale}/not-found${htmlExtension}`;
    }
};

module.exports = createPaths;
