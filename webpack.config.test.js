const path = require("path");
const config = require("./webpack.config");

config.module.rules.push(
  {
    enforce: "post",
    test:    /\.ts$/,
    include: path.resolve("./lib"),
    loader:  "istanbul-instrumenter-loader",
  }
);

module.exports = config;
