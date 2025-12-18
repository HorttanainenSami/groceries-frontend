const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the shared_types directory to watchFolders so Metro can follow the symlink
const sharedTypesPath = path.resolve(__dirname, '../shared_types');
config.watchFolders = [sharedTypesPath];

// Configure resolver to handle the symlinked package
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../shared_types/node_modules'),
];

// Ensure Metro resolves modules from both the app and shared_types
config.resolver.extraNodeModules = {
  '@groceries/shared_types': sharedTypesPath,
};

module.exports = config;
