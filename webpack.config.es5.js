const config = require("./webpack.config");
const tsconfig = require("./tsconfig.json");

config.output.filename = "web-es5/lib/[name].js";
tsconfig.compilerOptions.target = "es5";
tsconfig.compilerOptions.outDir = "web-es5"; // for d.ts

module.exports = config;
