const webpackConfig = require("webpack-config-narazaka-ts-js").webTest;

module.exports = (config) =>
  config.set({
    frameworks: ["detectBrowsers", "mocha"],
    plugins:    [
      "karma-mocha",
      "karma-webpack",
      "karma-mocha-own-reporter",
      "karma-ie-launcher",
      "karma-firefox-launcher",
      "karma-chrome-launcher",
      "karma-safari-launcher",
      "karma-opera-launcher",
      "karma-phantomjs-launcher",
      "karma-detect-browsers",
      "karma-coverage",
    ],
    files: [
      require.resolve("mocha-lazy-bdd/dist/mocha-lazy-bdd"),
      "mock/mocha-lazy-bdd.js",
      "test/**/*.js",
      "test/**/*.ts",
    ],
    exclude:       ["**/*.swp"],
    preprocessors: {
      "test/**/*.js": ["webpack"],
      "test/**/*.ts": ["webpack"],
    },
    webpack:           webpackConfig,
    coverageReporter: {
      reporters:           [
        {type: "lcov"},
        {type: "html"},
        {type: "text"},
      ],
    },
    reporters:             ["mocha-own", "coverage"],
    detectBrowsers:        {
      postDetection(availableBrowsers) {
        const result = availableBrowsers;
        if (process.env.TRAVIS) {
          const chromeIndex = availableBrowsers.indexOf("Chrome");
          if (chromeIndex >= 0) {
            result.splice(chromeIndex, 1);
            result.push("ChromeTravisCI");
          }
        }
        return result;
      },
    },
    customLaunchers: {
      ChromeTravisCI: {
        base:  "Chrome",
        flags: ["--no-sandbox"],
      },
    },
  });
