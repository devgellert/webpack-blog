const webpack = require("webpack");
const conf = require("./webpack.config");

const compiler = webpack(conf);

compiler.run(err => {
    if (err) {
        console.error("Failed to compile..");
    }
});
