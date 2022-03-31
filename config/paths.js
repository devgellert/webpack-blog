const path = require("path");
const fs = require("fs");

console.log(process.cwd());

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
    dotenv: resolveApp(".env"),
    pagesConfig: resolveApp("pages-config.json"),
    translationsConfig: resolveApp("i18n.json"),
    scripts: resolveApp("src/scripts"),
    homeJs: resolveApp("src/scripts/home.js"),
    dist: resolveApp("dist")
};
