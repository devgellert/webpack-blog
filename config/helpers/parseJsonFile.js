const fs = require("fs");

module.exports = path => {
    if (fs.existsSync(path)) {
        const file = fs.readFileSync(path);

        return JSON.parse(file.toString());
    }

    return null;
};
