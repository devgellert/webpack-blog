const dotenv = require("dotenv");
const paths = require("./paths");

dotenv.config({
    path: paths.dotenv
});

const defaultLocale = process.env.DEFAULT_LOCALE || null;

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
    },
    notFound: locale => {
        if (defaultLocale === locale) {
            return "not-found.html";
        }

        return `${locale}/not-found.html`;
    }
};

module.exports = createFilenames;
