const fs = require("fs");
const paths = require("./paths");
const path = require("path");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const scripts = fs.readdirSync(paths.scripts);

const scriptEntries = {};

scripts.forEach(script => {
    const withoutExt = path.parse(script).name;
    scriptEntries[withoutExt] = resolveApp(`src/scripts/${script}`);
});

module.exports = scriptEntries;
