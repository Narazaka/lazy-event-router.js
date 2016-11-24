const config = require("webpack-config-narazaka-ts-js").web;

config.entry["lazy-event-router"] = "./src/lib/lazy-event-router.ts";
config.output.library = "lazyEventRouter";

module.exports = config;
