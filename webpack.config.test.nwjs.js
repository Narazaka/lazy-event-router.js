const config = require("./webpack.config.test");
config.target = "node-webkit";
module.exports = config;
