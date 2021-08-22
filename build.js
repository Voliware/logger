const NodeBuild = require('@voliware/node-build');
const version = require('./package.json').version;
const name = "Logger";
const input = ['./src/loggerMessage.js', './src/logger.js'];
const output = './dist/logger.min.js';
new NodeBuild.FileBuilder({name, version, input, output, minify: true}).run();