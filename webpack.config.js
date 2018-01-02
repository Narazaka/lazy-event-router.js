const path = require("path");
const tsconfig = require("./tsconfig.json");

tsconfig.compilerOptions.outDir = "web"; // for d.ts

module.exports = {
  entry:  {"lazy-event-router": "./lib/lazy-event-router.ts"},
  output: {
    library:       "lazyEventRouter",
    libraryTarget: "umd",
    path:          path.resolve("."),
    filename:      "web/lib/[name].js",
  },
  module: {
    rules: [
      {
        test:    /\.ts$/,
        loader:  "ts-loader",
        exclude: /node_modules/,
        options: {compilerOptions: tsconfig.compilerOptions},
      },
    ],
  },
  resolve: {
    extensions: [
      ".ts",
      ".js",
    ],
  },
  // externals: /^(?!^\.\/)/,
  devtool: "source-map",
};
