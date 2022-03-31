const dotenv = require("dotenv");
const paths = require("./paths");
const createPaths = require("./createPaths");

dotenv.config({
    path: paths.dotenv
});

const locales = (process.env.LOCALES || "").split(",");

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

module.exports = createCommonConfig;
