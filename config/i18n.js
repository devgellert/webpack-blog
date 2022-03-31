const fs = require("fs");
const paths = require("./paths");

let i18n = null;

if (fs.existsSync(paths.translationsConfig)) {
    const content = fs.readFileSync(paths.translationsConfig);

    i18n = JSON.parse(content.toString());
}

module.exports = i18n;
