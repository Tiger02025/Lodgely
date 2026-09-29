const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Only watch the app source, not the whole monorepo, so Metro does not spend
// time crawling the API/web builds next door.
config.watchFolders = [path.resolve(projectRoot, 'src')];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(projectRoot, '../..', 'node_modules'),
];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
