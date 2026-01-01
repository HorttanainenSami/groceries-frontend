const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure path aliases for Metro bundler
config.resolver.extraNodeModules = {
  '@': __dirname,
};

module.exports = config;
