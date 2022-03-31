const translationConfig = require("../i18n");

const getPageAndGlobalTranslations = (locale, page) => {
    const localeConfig = translationConfig?.[locale] ?? {};

    const i18n = localeConfig?.[page] ?? {};

    return {
        ...i18n,
        global: localeConfig?.global ?? {}
    };
};

module.exports = getPageAndGlobalTranslations;
