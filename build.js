const NodeBuild = require('@voliware/node-build');
const version = "1.4.3";
const name = "Logger";
const input = './src/logger.js';
const output = './dist/logger.min.js';
new NodeBuild.Build({name, version, input, output}).run();